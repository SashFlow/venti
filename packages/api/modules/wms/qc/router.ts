import { completeQcInspection } from "./procedures/complete-qc-inspection";
import { createQcInspection } from "./procedures/create-qc-inspection";
import { findQcInspection } from "./procedures/find-qc-inspection";
import { listQcHolds } from "./procedures/list-qc-holds";
import { releaseQcHold } from "./procedures/release-qc-hold";

export const qcRouter = {
	inspections: {
		create: createQcInspection,
		find: findQcInspection,
		complete: completeQcInspection,
	},
	holds: {
		list: listQcHolds,
		release: releaseQcHold,
	},
};
