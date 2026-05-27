import { createSupplierProcedure } from "./procedures/create-supplier";
import { createUOMProcedure } from "./procedures/create-uom";
import { deleteSupplierProcedure } from "./procedures/delete-supplier";
import { deleteUOMProcedure } from "./procedures/delete-uom";
import { exportSuppliersProcedure } from "./procedures/export-suppliers";
import { getSupplierProcedure } from "./procedures/get-supplier";
import { getSupplierImportTemplateProcedure } from "./procedures/get-supplier-import-template";
import { importSuppliersProcedure } from "./procedures/import-suppliers";
import { listSupplierPurchaseOrdersProcedure } from "./procedures/list-supplier-purchase-orders";
import { listSuppliersProcedure } from "./procedures/list-suppliers";
import { listUOMsProcedure } from "./procedures/list-uoms";
import { updateSupplierProcedure } from "./procedures/update-supplier";
import { updateUOMProcedure } from "./procedures/update-uom";

export const masterDataRouter = {
	suppliers: {
		list: listSuppliersProcedure,
		get: getSupplierProcedure,
		create: createSupplierProcedure,
		update: updateSupplierProcedure,
		delete: deleteSupplierProcedure,
		import: importSuppliersProcedure,
		importTemplate: getSupplierImportTemplateProcedure,
		export: exportSuppliersProcedure,

		listPurchaseOrders: listSupplierPurchaseOrdersProcedure,
	},
	uoms: {
		list: listUOMsProcedure,
		create: createUOMProcedure,
		update: updateUOMProcedure,
		delete: deleteUOMProcedure,
	},
};
