import { createProductProcedure } from "./procedures/create-product";
import { deleteProductProcedure } from "./procedures/delete-product";
import { getProductProcedure } from "./procedures/get-product";
import { listProductsProcedure } from "./procedures/list-products";
import { updateProductProcedure } from "./procedures/update-product";

export const productsRouter = {
	list: listProductsProcedure,
	get: getProductProcedure,
	create: createProductProcedure,
	update: updateProductProcedure,
	delete: deleteProductProcedure,
};
