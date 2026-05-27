import { createUOM } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

export const createUOMProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/master-data/uoms",
		tags: ["Master Data"],
		summary: "Create Unit of Measure",
	})
	.input(
		z.object({
			code: z.string().min(1),
			name: z.string().min(1),
		}),
	)
	.handler(async ({ input }) => {
		return createUOM(input);
	});
