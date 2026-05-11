import { db } from "@repo/database";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { logger } from "@repo/logs";

type AuditInput = {
	organizationId?: string;
	userId?: string;
	action: string;
	resource: string;
	resourceId?: string;
	metadata?: Prisma.InputJsonValue;
	headers?: Headers;
};

function readIpAddress(headers?: Headers) {
	if (!headers) {
		return undefined;
	}

	const forwardedFor = headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() || undefined;
	}

	return headers.get("x-real-ip") ?? undefined;
}

export async function writeAuditLog(input: AuditInput) {
	try {
		await db.auditLog.create({
			data: {
				organizationId: input.organizationId,
				userId: input.userId,
				action: input.action,
				resource: input.resource,
				resourceId: input.resourceId,
				metadata: input.metadata,
				ipAddress: readIpAddress(input.headers),
				userAgent: input.headers?.get("user-agent") ?? undefined,
			},
		});
	} catch (error) {
		logger.error("Failed to write audit log", error);
	}
}
