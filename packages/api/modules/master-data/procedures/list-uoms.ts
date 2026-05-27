import { listUOMs } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";

export const listUOMsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/master-data/uoms",
		tags: ["Master Data"],
		summary: "List Unit of Measures",
		description: "List all unit of measures globally.",
	})
	.handler(async () => {
		return listUOMs();
	});
