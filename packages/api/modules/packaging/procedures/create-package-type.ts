import { ORPCError } from "@orpc/server";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createPackageType } from "../services/packaging-service";

const createPackageTypeInput = z.object({
	organizationId: z.string(),
	name: z.string().trim().min(1).max(255),
	description: z.string().trim().optional(),
	packageType: z.string().trim().min(1).max(50),
	price: z.number().min(0).default(0),
	length: z.number().positive().default(1),
	width: z.number().positive().default(1),
	height: z.number().positive().default(1),
	weight: z.number().positive().default(1),
	dimensionUnit: z.enum(["in", "cm"]).default("in"),
	weightUnit: z.enum(["lb", "kg"]).default("lb"),
	applyToAllWarehouses: z.boolean().default(true),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createPackageTypeProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/packaging",
		tags: ["Packaging"],
		summary: "Create package type",
		description: "Create a package type under an organization.",
	})
	.input(createPackageTypeInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		try {
			const packageType = await createPackageType({
				organizationId: input.organizationId,
				data: {
					name: input.name,
					description: input.description,
					packageType: input.packageType,
					price: input.price,
					length: input.length,
					width: input.width,
					height: input.height,
					weight: input.weight,
					dimensionUnit: input.dimensionUnit,
					weightUnit: input.weightUnit,
					applyToAllWarehouses: input.applyToAllWarehouses,
					metadata: input.metadata as
						| Prisma.InputJsonValue
						| undefined,
				},
			});

			await writeAuditLog({
				headers,
				organizationId: input.organizationId,
				userId: user.id,
				action: "packaging.create",
				resource: "package_type",
				resourceId: packageType.id,
				metadata: {
					name: packageType.name,
					packageType: packageType.packageType,
				},
			});

			return { packageType };
		} catch {
			throw new ORPCError("BAD_REQUEST", {
				message: "Could not create package type.",
			});
		}
	});
