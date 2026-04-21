import { createSupplier } from "./procedures/create-supplier";
import { findSupplier } from "./procedures/find-supplier";
import { listSuppliers } from "./procedures/list-suppliers";
import { updateSupplier } from "./procedures/update-supplier";

export const supplierRouter = {
	create: createSupplier,
	list: listSuppliers,
	find: findSupplier,
	update: updateSupplier,
};
