import { createSupplierProcedure } from "./procedures/create-supplier";
import { createUomProcedure } from "./procedures/create-uom";
import { deleteSupplierProcedure } from "./procedures/delete-supplier";
import { deleteUomProcedure } from "./procedures/delete-uom";
import { getSupplierProcedure } from "./procedures/get-supplier";
import { getUomProcedure } from "./procedures/get-uom";
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
	},
	uoms: {
		list: listUomsProcedure,
		get: getUomProcedure,
		create: createUomProcedure,
		update: updateUomProcedure,
		delete: deleteUomProcedure,
	},
};
