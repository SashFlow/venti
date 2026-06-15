import {
	completeWorkflowStepProcedure,
	getWorkflowProcedure,
	runWorkflowDemoProcedure,
	saveWorkflowProcedure,
} from "./procedures/workflow-procedures";

export const workflowsRouter = {
	save: saveWorkflowProcedure,
	getInbound: getWorkflowProcedure,
	runDemo: runWorkflowDemoProcedure,
	completeStep: completeWorkflowStepProcedure,
};
