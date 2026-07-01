import { db, getSupplierCode } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const exportSuppliersInput = z.object({
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

export const exportSuppliersProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/master-data/suppliers/export",
		tags: ["Master Data"],
		summary: "Export suppliers",
		description: "Export suppliers as a CSV payload.",
	})
	.input(exportSuppliersInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const query = input.query?.trim().toLowerCase();

		const suppliers = await db.supplier.findMany({
			where: {
				organizationId: input.organizationId,
				...(query
					? {
							OR: [
								{
									name: {
										contains: query,
										mode: "insensitive",
									},
								},
								{
									email: {
										contains: query,
										mode: "insensitive",
									},
								},
							],
						}
					: {}),
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				name: true,
				metadata: true,
			},
		});

		const filteredSuppliers = query
			? suppliers.filter((supplier) => {
					const code = getSupplierCode(supplier).toLowerCase();
					return (
						code.includes(query) ||
						supplier.name.toLowerCase().includes(query)
					);
				})
			: suppliers;

		const header = [
			"Code",
			"Name",
			"Account Number",
			"Rep Name",
			"Street Address",
			"Apt/Suite",
			"City",
			"State",
			"Zip",
			"Country",
			"Brands",
			"Note",
		];

		const rows = filteredSuppliers.map((supplier) => {
			const metadata =
				supplier.metadata && typeof supplier.metadata === "object"
					? (supplier.metadata as Record<string, unknown>)
					: {};

			return [
				escapeCsv(getSupplierCode(supplier)),
				escapeCsv(supplier.name),
				escapeCsv(
					typeof metadata.accountNumber === "string"
						? metadata.accountNumber
						: "",
				),
				escapeCsv(
					typeof metadata.representativeName === "string"
						? metadata.representativeName
						: "",
				),
				escapeCsv(
					typeof metadata.address1 === "string"
						? metadata.address1
						: "",
				),
				escapeCsv(
					typeof metadata.address2 === "string"
						? metadata.address2
						: "",
				),
				escapeCsv(
					typeof metadata.city === "string" ? metadata.city : "",
				),
				escapeCsv(
					typeof metadata.state === "string" ? metadata.state : "",
				),
				escapeCsv(typeof metadata.zip === "string" ? metadata.zip : ""),
				escapeCsv(
					typeof metadata.country === "string"
						? metadata.country
						: "",
				),
				escapeCsv(
					typeof metadata.brands === "string" ? metadata.brands : "",
				),
				escapeCsv(
					typeof metadata.notes === "string" ? metadata.notes : "",
				),
			].join(",");
		});

		return {
			fileName: "suppliers_export.csv",
			contentType: "text/csv",
			csv: `${header.join(",")}\n${rows.join("\n")}`,
			count: filteredSuppliers.length,
		};
	});
