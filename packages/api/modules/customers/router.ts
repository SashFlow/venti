import { createCustomerProcedure } from "./procedures/create-customer";
import { deleteCustomerProcedure } from "./procedures/delete-customer";
import { exportCustomersProcedure } from "./procedures/export-customers";
import { getCustomerProcedure } from "./procedures/get-customer";
import { getCustomerImportTemplateProcedure } from "./procedures/get-customer-import-template";
import { importCustomersProcedure } from "./procedures/import-customers";
import { listCustomersProcedure } from "./procedures/list-customers";
import { updateCustomerProcedure } from "./procedures/update-customer";

export const customersRouter = {
	list: listCustomersProcedure,
	get: getCustomerProcedure,
	create: createCustomerProcedure,
	update: updateCustomerProcedure,
	delete: deleteCustomerProcedure,
	import: importCustomersProcedure,
	importTemplate: getCustomerImportTemplateProcedure,
	export: exportCustomersProcedure,
};
