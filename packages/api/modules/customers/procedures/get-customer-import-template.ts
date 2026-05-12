import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getCustomerImportTemplateInput = z.object({
	organizationId: z.string(),
});

const CUSTOMER_IMPORT_COLUMNS = [
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
] as const;

export const getCustomerImportTemplateProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/customers/import-template",
		tags: ["Customers"],
		summary: "Get customer import template",
		description: "Return CSV import template columns for customers.",
	})
	.input(getCustomerImportTemplateInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return {
			fileName: "customers_import_template.csv",
			contentType: "text/csv",
			csv: `${CUSTOMER_IMPORT_COLUMNS.join(",")}\n`,
		};
	});
