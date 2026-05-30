import { receiveInventoryProcedure } from "./procedures/receive-inventory";
import { createAsnProcedure } from "./procedures/create-asn";
import { createReceivingOrderProcedure } from "./procedures/create-receiving-order";
import { listAsnsProcedure } from "./procedures/list-asns";

export const inboundRouter = {
        receiveInventory: receiveInventoryProcedure,
	createAsn: createAsnProcedure,
	listAsns: listAsnsProcedure,
	createReceivingOrder: createReceivingOrderProcedure,
};
