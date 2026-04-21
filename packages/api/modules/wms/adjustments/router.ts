import { approveAdjustment } from "./procedures/approve-adjustment";
import { createAdjustment } from "./procedures/create-adjustment";
import { findAdjustment } from "./procedures/find-adjustment";
import { listAdjustments } from "./procedures/list-adjustments";
import { rejectAdjustment } from "./procedures/reject-adjustment";

export const adjustmentRouter = {
	create: createAdjustment,
	list: listAdjustments,
	find: findAdjustment,
	approve: approveAdjustment,
	reject: rejectAdjustment,
};
