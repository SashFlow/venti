import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getSupplierImportTemplateInput = z.object({
	organizationId: z.string(),
});

const SUPPLIER_IMPORT_COLUMNS = [
	"Name",
	"Account Number",
	"Apt/Suite",
	"Brands",
	"City",
	"Country",
	"Email",
	"Note",
	"Phone",
	"Prefix",
	"Rep Name",
	"State",
	"Street Address",
	"Zip",
] as const;

export const getSupplierImportTemplateProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/master-data/suppliers/import-template",
		tags: ["Master Data"],
		summary: "Get supplier import template",
		description: "Return CSV import template columns for suppliers.",
	})
	.input(getSupplierImportTemplateInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return {
			fileName: "suppliers_import_template.csv",
			contentType: "text/csv",
			csv: `${SUPPLIER_IMPORT_COLUMNS.join(",")}\n`,
		};
	});
