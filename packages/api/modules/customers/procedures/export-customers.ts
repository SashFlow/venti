import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const exportCustomersInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
});

function escapeCsv(value: string | null | undefined) {
	if (!value) {
		return "";
	}

	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replaceAll('"', '""')}"`;
	}

	return value;
}

export const exportCustomersProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/customers/export",
		tags: ["Customers"],
		summary: "Export customers",
		description: "Export customers as a CSV payload.",
	})
	.input(exportCustomersInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const query = input.query?.trim();

		const customers = await db.customer.findMany({
			where: {
				organizationId: input.organizationId,
				OR: query
					? [
							{ name: { contains: query, mode: "insensitive" } },
							{ code: { contains: query, mode: "insensitive" } },
						]
					: undefined,
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				code: true,
				name: true,
				email: true,
				phone: true,
				isWholesaler: true,
				notes: true,
				metadata: true,
			},
		});

		const header = [
			"Name",
			"Apt/Suite",
			"City",
			"Country",
			"Email",
			"Note",
			"Phone",
			"State",
			"Street Address",
			"Wholesale",
			"Zip",
		];

		const rows = customers.map((customer) => {
			const metadata =
				customer.metadata && typeof customer.metadata === "object"
					? (customer.metadata as Record<string, unknown>)
					: {};

			return [
				escapeCsv(customer.name),
				escapeCsv(
					typeof metadata.address2 === "string"
						? metadata.address2
						: "",
				),
				escapeCsv(
					typeof metadata.city === "string" ? metadata.city : "",
				),
				escapeCsv(
					typeof metadata.country === "string"
						? metadata.country
						: "",
				),
				escapeCsv(customer.email),
				escapeCsv(customer.notes),
				escapeCsv(customer.phone),
				escapeCsv(
					typeof metadata.state === "string" ? metadata.state : "",
				),
				escapeCsv(
					typeof metadata.address1 === "string"
						? metadata.address1
						: "",
				),
				escapeCsv(String(customer.isWholesaler)),
				escapeCsv(typeof metadata.zip === "string" ? metadata.zip : ""),
			].join(",");
		});

		return {
			fileName: "customers_export.csv",
			contentType: "text/csv",
			csv: `${header.join(",")}\n${rows.join("\n")}`,
			count: customers.length,
		};
	});
