import { createSupplierProcedure } from "./procedures/create-supplier";
import { createUomProcedure } from "./procedures/create-uom";
import { deleteSupplierProcedure } from "./procedures/delete-supplier";
import { deleteUomProcedure } from "./procedures/delete-uom";
import { exportSuppliersProcedure } from "./procedures/export-suppliers";
import { getSupplierProcedure } from "./procedures/get-supplier";
import { getSupplierImportTemplateProcedure } from "./procedures/get-supplier-import-template";
import { getUomProcedure } from "./procedures/get-uom";
import { importSuppliersProcedure } from "./procedures/import-suppliers";
import { listSupplierPurchaseOrdersProcedure } from "./procedures/list-supplier-purchase-orders";
import { listSupplierSkusProcedure } from "./procedures/list-supplier-skus";
import { listSuppliersProcedure } from "./procedures/list-suppliers";
import { listUomsProcedure } from "./procedures/list-uoms";
import { updateSupplierProcedure } from "./procedures/update-supplier";
import { updateUomProcedure } from "./procedures/update-uom";

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
		listSkus: listSupplierSkusProcedure,
		listPurchaseOrders: listSupplierPurchaseOrdersProcedure,
	},
	uoms: {
		list: listUomsProcedure,
		get: getUomProcedure,
		create: createUomProcedure,
		update: updateUomProcedure,
		delete: deleteUomProcedure,
	},
};
