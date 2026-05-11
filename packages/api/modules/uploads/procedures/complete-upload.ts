import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import z from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";

const completionStatusSchema = z.enum(["UPLOADED", "FAILED", "DELETED"]);

export const completeUpload = protectedProcedure
	.route({
		method: "POST",
		path: "/uploads/complete-upload",
		tags: ["Uploads"],
		summary: "Complete tracked upload",
		description:
			"Mark an upload_file as completed (or failed/deleted) after client-side upload finishes.",
	})
	.input(
		z.object({
			uploadFileId: z.string(),
			status: completionStatusSchema.default("UPLOADED"),
			sizeBytes: z.number().int().positive().optional(),
			checksum: z.string().trim().min(1).max(255).optional(),
			metadata: z.record(z.string(), z.any()).optional(),
			linkToOrganizationLogo: z.boolean().default(false),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		const upload = await db.uploadFile.findUnique({
			where: {
				id: input.uploadFileId,
			},
			select: {
				id: true,
				uploadedByUserId: true,
				organizationId: true,
			},
		});

		if (!upload) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Upload file not found",
			});
		}

		if (upload.organizationId) {
			await verifyOrganizationMembership(upload.organizationId, user.id);
		} else if (
			upload.uploadedByUserId !== user.id &&
			user.role !== "admin"
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const updatedUpload = await db.uploadFile.update({
			where: {
				id: input.uploadFileId,
			},
			data: {
				status: input.status,
				sizeBytes: input.sizeBytes,
				checksum: input.checksum,
				metadata: input.metadata,
			},
			select: {
				id: true,
				status: true,
				path: true,
				bucket: true,
				organizationId: true,
				updatedAt: true,
			},
		});

		if (input.linkToOrganizationLogo && updatedUpload.organizationId) {
			await db.organization.update({
				where: {
					id: updatedUpload.organizationId,
				},
				data: {
					logo: updatedUpload.path,
					logoUploadFileId: updatedUpload.id,
				},
			});
		}

		return updatedUpload;
	});
