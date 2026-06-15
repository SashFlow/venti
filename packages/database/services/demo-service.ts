import { db } from "../prisma";

export async function resetDemoState(params: { organizationId: string }) {
	await db.insightDismissal.deleteMany({
		where: { organizationId: params.organizationId },
	});

	return {
		ok: true,
		message:
			"Demo flags cleared. Re-run seed (layout-and-simulation) for full data reset.",
	};
}
