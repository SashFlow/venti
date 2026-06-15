import {
	listRulesProcedure,
	listRecentActionsProcedure,
	runRulesNowProcedure,
	updateRuleProcedure,
} from "./procedures/autopilot-procedures";

export const autopilotRouter = {
	listRules: listRulesProcedure,
	updateRule: updateRuleProcedure,
	runRulesNow: runRulesNowProcedure,
	listRecentActions: listRecentActionsProcedure,
};
