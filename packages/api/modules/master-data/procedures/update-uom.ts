import { updateUOM } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

export const updateUOMProcedure = protectedProcedure
	.route({
		method: "PUT",
		path: "/master-data/uoms/{id}",
		tags: ["Master Data"],
		summary: "Update Unit of Measure",
	})
	.input(
		z.object({
			id: z.string(),
			code: z.string().min(1).optional(),
			name: z.string().min(1).optional(),
		}),
	)
	.handler(async ({ input }) => {
		return updateUOM(input.id, input);
	});
