import { completeReturnDispositionProcedure } from "./procedures/complete-return-disposition";
import { createReturnOrderProcedure } from "./procedures/create-return-order";
import { listReturnOrdersProcedure } from "./procedures/list-return-orders";
import { returnToSupplierProcedure } from "./procedures/return-to-supplier";

export const returnsRouter = {
	returnToSupplier: returnToSupplierProcedure,
	createReturnOrder: createReturnOrderProcedure,
	listReturnOrders: listReturnOrdersProcedure,
	completeReturnDisposition: completeReturnDispositionProcedure,
};
