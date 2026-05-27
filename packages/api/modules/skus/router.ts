import { createSKUProcedure } from "./procedures/create-sku";
import { deleteSKUProcedure } from "./procedures/delete-sku";
import { getSKUProcedure } from "./procedures/get-sku";
import { listSKUsProcedure } from "./procedures/list-skus";
import { updateSKUProcedure } from "./procedures/update-sku";

export const skusRouter = {
	list: listSKUsProcedure,
	get: getSKUProcedure,
	create: createSKUProcedure,
	update: updateSKUProcedure,
	delete: deleteSKUProcedure,
};
