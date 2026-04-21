import { createGrn } from "./procedures/create-grn";
import { createPurchaseOrder } from "./procedures/create-purchase-order";
import { findGrn } from "./procedures/find-grn";
import { findPurchaseOrder } from "./procedures/find-purchase-order";
import { listGrns } from "./procedures/list-grns";
import { listPurchaseOrders } from "./procedures/list-purchase-orders";
import { receiveGrn } from "./procedures/receive-grn";
import { completeGrn } from "./procedures/complete-grn";
import { updatePoStatus } from "./procedures/update-po-status";
import { upsertLandedCost } from "./procedures/upsert-landed-cost";

export const procurementRouter = {
	purchaseOrders: {
		create: createPurchaseOrder,
		list: listPurchaseOrders,
		find: findPurchaseOrder,
		updateStatus: updatePoStatus,
		upsertLandedCost,
	},
	grns: {
		create: createGrn,
		find: findGrn,
		list: listGrns,
		receive: receiveGrn,
		complete: completeGrn,
	},
};
