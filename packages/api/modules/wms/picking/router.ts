import { activateWave } from "./procedures/activate-wave";
import { createBatchPick } from "./procedures/create-batch-pick";
import { createPickJob } from "./procedures/create-pick-job";
import { createWave } from "./procedures/create-wave";
import { completePickJob } from "./procedures/complete-pick-job";
import { findPickJob } from "./procedures/find-pick-job";
import { findWave } from "./procedures/find-wave";
import { listPickJobs } from "./procedures/list-pick-jobs";
import { listWaves } from "./procedures/list-waves";
import { startPickJob } from "./procedures/start-pick-job";

export const pickingRouter = {
	waves: {
		create: createWave,
		list: listWaves,
		find: findWave,
		activate: activateWave,
	},
	batch: {
		create: createBatchPick,
	},
	jobs: {
		create: createPickJob,
		list: listPickJobs,
		find: findPickJob,
		start: startPickJob,
		complete: completePickJob,
	},
};
