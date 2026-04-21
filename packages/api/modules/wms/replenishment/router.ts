import { upsertReplenishmentRule } from "./procedures/upsert-replenishment-rule";
import { listReplenishmentRules } from "./procedures/list-replenishment-rules";
import { deleteReplenishmentRule } from "./procedures/delete-replenishment-rule";
import { upsertSeasonalPlan } from "./procedures/upsert-seasonal-plan";
import { listSeasonalPlans } from "./procedures/list-seasonal-plans";
import { createWeatherSignal } from "./procedures/create-weather-signal";
import { listWeatherSignals } from "./procedures/list-weather-signals";
import { updateWeatherSignal } from "./procedures/update-weather-signal";
import { upsertTierRule } from "./procedures/upsert-tier-rule";
import { listTierRules } from "./procedures/list-tier-rules";

export const replenishmentRouter = {
	rules: {
		upsert: upsertReplenishmentRule,
		list: listReplenishmentRules,
		delete: deleteReplenishmentRule,
	},
	seasonal: {
		upsert: upsertSeasonalPlan,
		list: listSeasonalPlans,
	},
	weather: {
		create: createWeatherSignal,
		list: listWeatherSignals,
		update: updateWeatherSignal,
	},
	tier: {
		upsert: upsertTierRule,
		list: listTierRules,
	},
};
