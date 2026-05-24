import { createAsnProcedure } from "./procedures/create-asn";
import { createReceivingOrderProcedure } from "./procedures/create-receiving-order";
import { listAsnsProcedure } from "./procedures/list-asns";

export const inboundRouter = {
	createAsn: createAsnProcedure,
	listAsns: listAsnsProcedure,
	createReceivingOrder: createReceivingOrderProcedure,
};
