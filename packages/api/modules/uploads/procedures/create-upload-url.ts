import { randomUUID } from "node:crypto";
import { ORPCError } from "@orpc/server";
import { config } from "@repo/config";
import { db } from "@repo/database";
import { getSignedUploadUrl } from "@repo/storage";
import z from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";

const bucketNameByKey = {
	avatars: config.storage.bucketNames.avatars,
	notes: config.storage.bucketNames.notes,
	fell: config.storage.bucketNames.fell,
	pictures: config.storage.bucketNames.pictures,
} as const;

const uploadScopeSchema = z.enum([
	"ORGANIZATION_LOGO",
	"USER_AVATAR",
	"NOTE_IMAGE",
	"GENERIC",
]);

const createUploadPath = ({
	organizationId,
	userId,
	scope,
	fileName,
}: {
	organizationId?: string;
	userId: string;
	scope: z.infer<typeof uploadScopeSchema>;
	fileName?: string;
}) => {
	const ownerSegment = organizationId ?? userId;
	const scopeSegment = scope.toLowerCase();
	const sanitizedName = (fileName ?? "file").replace(/[^a-zA-Z0-9._-]/g, "-");
	const id = randomUUID();

	return `${ownerSegment}/${scopeSegment}/${id}-${sanitizedName}`;
};

export const createUploadUrl = protectedProcedure
	.route({
		method: "POST",
		path: "/uploads/create-upload-url",
		tags: ["Uploads"],
		summary: "Create upload URL",
		description:
			"Create a signed upload URL and a tracked upload_file record for reusable upload workflows.",
	})
	.input(
		z.object({
			organizationId: z.string().optional(),
			bucketKey: z.enum(["avatars", "notes", "fell", "pictures"]),
			fileName: z.string().trim().min(1).max(255).optional(),
			mimeType: z.string().trim().min(1).max(255).optional(),
			scope: uploadScopeSchema.default("GENERIC"),
			metadata: z.record(z.string(), z.any()).optional(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		const {
			organizationId,
			bucketKey,
			fileName,
			mimeType,
			scope,
			metadata,
		} = input;

		if (organizationId) {
			await verifyOrganizationMembership(organizationId, user.id);
		}

		const bucket = bucketNameByKey[bucketKey];
		if (!bucket) {
			throw new ORPCError("BAD_REQUEST");
		}

		const path = createUploadPath({
			organizationId,
			userId: user.id,
			scope,
			fileName,
		});

		const uploadFile = await db.uploadFile.create({
			data: {
				organizationId,
				uploadedByUserId: user.id,
				bucket,
				path,
				fileName,
				mimeType,
				scope,
				metadata,
			},
			select: {
				id: true,
				path: true,
				bucket: true,
				status: true,
			},
		});

		const signedUploadUrl = await getSignedUploadUrl(path, {
			bucket,
		});

		return {
			uploadFileId: uploadFile.id,
			signedUploadUrl,
			path: uploadFile.path,
			bucket: uploadFile.bucket,
			status: uploadFile.status,
		};
	});
