import { createCustomerProcedure } from "./procedures/create-customer";
import { createCustomerLocationProcedure } from "./procedures/create-customer-location";
import { deleteCustomerProcedure } from "./procedures/delete-customer";
import { deleteCustomerLocationProcedure } from "./procedures/delete-customer-location";
import { exportCustomersProcedure } from "./procedures/export-customers";
import { getCustomerProcedure } from "./procedures/get-customer";
import { getCustomerImportTemplateProcedure } from "./procedures/get-customer-import-template";
import { importCustomersProcedure } from "./procedures/import-customers";
import { listCustomerLocationsProcedure } from "./procedures/list-customer-locations";
import { listCustomersProcedure } from "./procedures/list-customers";
import { updateCustomerProcedure } from "./procedures/update-customer";
import { updateCustomerLocationProcedure } from "./procedures/update-customer-location";

export const customersRouter = {
	list: listCustomersProcedure,
	get: getCustomerProcedure,
	create: createCustomerProcedure,
	update: updateCustomerProcedure,
	delete: deleteCustomerProcedure,
	import: importCustomersProcedure,
	importTemplate: getCustomerImportTemplateProcedure,
	export: exportCustomersProcedure,
	locations: {
		list: listCustomerLocationsProcedure,
		create: createCustomerLocationProcedure,
		update: updateCustomerLocationProcedure,
		delete: deleteCustomerLocationProcedure,
	},
};
