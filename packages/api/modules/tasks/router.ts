import { createTaskProcedure } from "./procedures/create-task";
import { assignTaskProcedure } from "./procedures/assign-task";
import { listTasksProcedure } from "./procedures/list-tasks";

export const tasksRouter = {
	listTasks: listTasksProcedure,
	assignTask: assignTaskProcedure,
	createTask: createTaskProcedure,
};
