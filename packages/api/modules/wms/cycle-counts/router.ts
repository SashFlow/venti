import { completeCycleCount } from "./procedures/complete-cycle-count";
import { createCycleCount } from "./procedures/create-cycle-count";
import { findCycleCount } from "./procedures/find-cycle-count";
import { listCycleCounts } from "./procedures/list-cycle-counts";
import { startCycleCount } from "./procedures/start-cycle-count";
import { submitCountLines } from "./procedures/submit-count-lines";

export const cycleCountRouter = {
	create: createCycleCount,
	list: listCycleCounts,
	find: findCycleCount,
	start: startCycleCount,
	submitLines: submitCountLines,
	complete: completeCycleCount,
};
