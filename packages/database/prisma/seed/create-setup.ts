import { auth } from "@repo/auth";
import { logger } from "@repo/logs";
import { db } from "../client";
import {
	createUser,
	createUserAccount,
	getUserByEmail,
} from "../queries/users";
import { CONFIG } from "./config";

export async function generate_admin_user() {
	logger.info("Let's create a new user for your application!");

	const email = CONFIG.EMAIL;

	const name = CONFIG.NAME;

	const authContext = await auth.$context;
	const adminPassword = CONFIG.PASSWORD;
	const hashedPassword = await authContext.password.hash(adminPassword);

	// check if user exists
	const user = await getUserByEmail(email);

	if (user) {
		logger.error("User with this email already exists!");
		return;
	}

	const adminUser = await createUser({
		email,
		name,
		role: CONFIG.CREATE_ADMIN ? "admin" : "user",
		emailVerified: true,
		onboardingComplete: true,
	});

	if (!adminUser) {
		logger.error("Failed to create user!");
		return;
	}

	await createUserAccount({
		userId: adminUser.id,
		providerId: "credential",
		accountId: adminUser.id,
		hashedPassword,
	});

	return adminUser;
}

export async function generate_organization() {
	return await db.organization.create({
		data: {
			name: CONFIG.ORG_NAME,
			slug: CONFIG.ORG_NAME.toLowerCase(),
			createdAt: new Date(),
		},
	});
}

export async function generate_rolegroup(id: string) {
	return await db.roleGroup.create({
		data: {
			organizationId: id,
			name: "Full Access",
			updatedAt: new Date(),
		},
	});
}

export async function create_access() {
	const user = await generate_admin_user();
	const org = await generate_organization();

	if (user) {
		await db.member.create({
			data: {
				userId: user?.id,
				role: "member",
				organizationId: org.id,
				createdAt: new Date(),
			},
		});
	} else {
		throw "ERROR: UNABLE TO CREATE USER";
	}
	return org;
}

const warehouses = [
	{
		name: "Hyderabad Central Hub",
		code: "HYD-01",
		address: {
			line1: "Plot 42, HITEC City",
			line2: "Madhapur",
			city: "Hyderabad",
			state: "Telangana",
			zip: "500081",
			country: "India",
		},
	},
	{
		name: "Bengaluru Tech Park Warehouse",
		code: "BLR-01",
		address: {
			line1: "1st Main Road, Electronics City",
			line2: "Phase 1",
			city: "Bengaluru",
			state: "Karnataka",
			zip: "560100",
			country: "India",
		},
	},
	{
		name: "Chennai Port Logistics Center",
		code: "MAA-01",
		address: {
			line1: "15, Ennore High Road",
			line2: "Tiruvottiyur",
			city: "Chennai",
			state: "Tamil Nadu",
			zip: "600019",
			country: "India",
		},
	},
	{
		name: "Cochin Marine Hub",
		code: "COK-01",
		address: {
			line1: "Willingdon Island",
			line2: "Bristow Road",
			city: "Kochi",
			state: "Kerala",
			zip: "682003",
			country: "India",
		},
	},
	{
		name: "Sri City Industrial Warehouse",
		code: "SRC-01",
		address: {
			line1: "Central Expressway, Sri City SEZ",
			line2: "Satyavedu Mandal",
			city: "Sri City",
			state: "Andhra Pradesh",
			zip: "517646",
			country: "India",
		},
	},
];

export async function generate_warehouses(id: string) {
	warehouses.forEach(async (warehouse) => {
		const address = await db.address.create({
			data: {
				addressLine1: warehouse.address.line1,
				addressLine2: warehouse.address.line2,
				city: warehouse.address.city,
				state: warehouse.address.state,
				zip: warehouse.address.zip,
				country: warehouse.address.country,
			},
		});

		await db.warehouse.create({
			data: {
				name: warehouse.name,
				code: warehouse.code,
				timezone: "IST",
				organizationId: id,
				addressId: address.id,
				sameReturn: true,
			},
		});
	});
}

export async function main() {
	const org = await create_access();
	await generate_warehouses(org.id);
}

main();
