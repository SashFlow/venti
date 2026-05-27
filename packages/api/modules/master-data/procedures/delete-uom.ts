import { deleteUOM } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

export const deleteUOMProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/master-data/uoms/{id}",
		tags: ["Master Data"],
		summary: "Delete Unit of Measure",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input }) => {
		return deleteUOM(input.id);
	});
