import { createProductProcedure } from "./procedures/create-product";
import { listProductsProcedure } from "./procedures/list-products";

export const productsRouter = {
	list: listProductsProcedure,
	create: createProductProcedure,
};
