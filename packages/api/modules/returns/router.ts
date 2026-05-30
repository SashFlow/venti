import { returnToSupplierProcedure } from "./procedures/return-to-supplier";
import { createReturnOrderProcedure } from "./procedures/create-return-order";

export const returnsRouter = {
        returnToSupplier: returnToSupplierProcedure,
	createReturnOrder: createReturnOrderProcedure,
};
