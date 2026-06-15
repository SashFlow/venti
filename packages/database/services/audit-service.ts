import { db } from "../prisma";
import type { Prisma } from "../prisma/generated/client";

export async function listAuditLogs(params: {
	organizationId: string;
	userId?: string;
	action?: string;
	dateFrom?: Date;
	dateTo?: Date;
	limit?: number;
	offset?: number;
}) {
	const where: Prisma.AuditLogWhereInput = {
		organizationId: params.organizationId,
		...(params.userId ? { userId: params.userId } : {}),
		...(params.action
			? { action: { contains: params.action, mode: "insensitive" } }
			: {}),
		...(params.dateFrom || params.dateTo
			? {
					createdAt: {
						...(params.dateFrom ? { gte: params.dateFrom } : {}),
						...(params.dateTo ? { lte: params.dateTo } : {}),
					},
				}
			: {}),
	};

	const limit = params.limit ?? 50;
	const offset = params.offset ?? 0;

	const [logs, total] = await Promise.all([
		db.auditLog.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: limit,
			skip: offset,
			include: {
				user: { select: { id: true, name: true, email: true } },
			},
		}),
		db.auditLog.count({ where }),
	]);

	return {
		logs: logs.map((log) => ({
			id: log.id,
			timestamp: log.createdAt.toISOString(),
			action: log.action,
			resource: log.resource,
			resourceId: log.resourceId,
			actor: log.user?.name ?? log.user?.email ?? "System",
			channel: log.userAgent?.includes("Mobile") ? "Mobile" : "Web",
			severity:
				log.action.includes("DELETE") || log.action.includes("IMPORT")
					? ("review" as const)
					: ("info" as const),
			summary:
				typeof log.metadata === "object" &&
				log.metadata !== null &&
				"summary" in log.metadata &&
				typeof (log.metadata as { summary?: unknown }).summary === "string"
					? (log.metadata as { summary: string }).summary
					: `${log.action} on ${log.resource}`,
			metadata: log.metadata,
		})),
		total,
	};
}
