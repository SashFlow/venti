import { auth } from "@repo/auth";
import {
	createUser,
	createUserAccount,
	db,
	getUserByEmail,
} from "@repo/database";

const ADMIN = {
	email: "sahil@sashflow.com",
	password: "Sahil@123",
	name: "Sashflow Admin",
} as const;

export async function seedAdminUser() {
	const organization = await db.organization.findFirst({
		orderBy: { createdAt: "asc" },
	});

	if (!organization) {
		throw new Error(
			"No organization found. Run load-seed first to import seed data.",
		);
	}

	const authContext = await auth.$context;
	const hashedPassword = await authContext.password.hash(ADMIN.password);

	let user = await getUserByEmail(ADMIN.email);

	if (!user) {
		user = await createUser({
			email: ADMIN.email,
			name: ADMIN.name,
			role: "admin",
			emailVerified: true,
			onboardingComplete: true,
		});
	} else {
		await db.user.update({
			where: { id: user.id },
			data: {
				name: ADMIN.name,
				role: "admin",
				emailVerified: true,
				onboardingComplete: true,
				updatedAt: new Date(),
			},
		});
	}

	const existingAccount = await db.account.findFirst({
		where: {
			userId: user.id,
			providerId: "credential",
		},
	});

	if (existingAccount) {
		await db.account.update({
			where: { id: existingAccount.id },
			data: {
				password: hashedPassword,
				updatedAt: new Date(),
			},
		});
	} else {
		await createUserAccount({
			userId: user.id,
			providerId: "credential",
			accountId: user.id,
			hashedPassword,
		});
	}

	const existingMember = await db.member.findUnique({
		where: {
			organizationId_userId: {
				organizationId: organization.id,
				userId: user.id,
			},
		},
	});

	if (!existingMember) {
		await db.member.create({
			data: {
				userId: user.id,
				organizationId: organization.id,
				role: "owner",
				createdAt: new Date(),
			},
		});
	}

	console.log(
		`✅ Admin user ready: ${ADMIN.email} → org "${organization.name}" (${organization.id})`,
	);

	return { user, organization };
}

async function main() {
	await seedAdminUser();
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith(
	"seed-admin-user.ts",
);

if (isDirectRun) {
	main().catch((error) => {
		console.error("Failed to seed admin user:", error);
		process.exit(1);
	});
}
