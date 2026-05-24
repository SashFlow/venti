import { db as prisma } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getCapacityWarningsInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
});

export const getCapacityWarningsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/capacity/warnings",
		tags: ["Warehouse"],
		summary: "Get capacity warnings",
	})
	.input(getCapacityWarningsInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const locations = await prisma.location.findMany({
			where: {
				warehouseId: input.warehouseId,
				warehouse: { organizationId: input.organizationId },
				OR: [
					{
						currentVolume: {
							gt: prisma.location.fields.capacityVolume,
						},
						capacityVolume: { not: null },
					},
					{
						currentWeight: {
							gt: prisma.location.fields.capacityWeight,
						},
						capacityWeight: { not: null },
					},
				],
			},
		});

		// Alternatively, since prisma.location.fields is not available for comparison in this way in older Prisma versions,
		// we can do a raw query or just fetch locations with limits and filter in memory if the dataset is small,
		// but Prisma 5 supports field comparison. Wait, actually we can just use Prisma's `raw` or fetch them.

		// To be safe, I'll fetch locations with both capacity and current set.
		const allLocations = await prisma.location.findMany({
			where: {
				warehouseId: input.warehouseId,
				OR: [
					{
						capacityVolume: { not: null },
						currentVolume: { not: null },
					},
					{
						capacityWeight: { not: null },
						currentWeight: { not: null },
					},
				],
			},
		});

		const warnings = allLocations
			.filter((loc) => {
				const overVolume =
					loc.capacityVolume &&
					loc.currentVolume &&
					Number(loc.currentVolume) > Number(loc.capacityVolume);
				const overWeight =
					loc.capacityWeight &&
					loc.currentWeight &&
					Number(loc.currentWeight) > Number(loc.capacityWeight);
				return overVolume || overWeight;
			})
			.map((loc) => {
				const reasons = [];
				if (
					loc.capacityVolume &&
					loc.currentVolume &&
					Number(loc.currentVolume) > Number(loc.capacityVolume)
				) {
					reasons.push(
						`Over volume: ${loc.currentVolume} / ${loc.capacityVolume}`,
					);
				}
				if (
					loc.capacityWeight &&
					loc.currentWeight &&
					Number(loc.currentWeight) > Number(loc.capacityWeight)
				) {
					reasons.push(
						`Over weight: ${loc.currentWeight} / ${loc.capacityWeight}`,
					);
				}
				return {
					locationId: loc.id,
					code: loc.code,
					type: loc.type,
					reasons,
				};
			});

		return warnings;
	});
