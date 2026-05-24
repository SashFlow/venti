import { createReturnOrderProcedure } from "./procedures/create-return-order";

export const returnsRouter = {
	createReturnOrder: createReturnOrderProcedure,
};
