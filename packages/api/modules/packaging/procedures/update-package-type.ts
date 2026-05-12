import { ORPCError } from "@orpc/server";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { updatePackageType } from "../services/packaging-service";

const updatePackageTypeInput = z.object({
	organizationId: z.string(),
	id: z.string(),
	name: z.string().trim().min(1).max(255).optional(),
	description: z.string().trim().optional(),
	packageType: z.string().trim().min(1).max(50).optional(),
	price: z.number().min(0).optional(),
	length: z.number().positive().optional(),
	width: z.number().positive().optional(),
	height: z.number().positive().optional(),
	weight: z.number().positive().optional(),
	dimensionUnit: z.enum(["in", "cm"]).optional(),
	weightUnit: z.enum(["lb", "kg"]).optional(),
	applyToAllWarehouses: z.boolean().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updatePackageTypeProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/packaging/{id}",
		tags: ["Packaging"],
		summary: "Update package type",
		description: "Update package type fields for an organization.",
	})
	.input(updatePackageTypeInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const packageType = await updatePackageType({
			organizationId: input.organizationId,
			id: input.id,
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
				metadata: input.metadata as Prisma.InputJsonValue | undefined,
			},
		});

		if (!packageType) {
			throw new ORPCError("NOT_FOUND", {
				message: "Package type not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "packaging.update",
			resource: "package_type",
			resourceId: packageType.id,
			metadata: {
				name: packageType.name,
				packageType: packageType.packageType,
			},
		});

		return { packageType };
	});
