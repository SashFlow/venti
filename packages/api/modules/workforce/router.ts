import { assignMemberRoleGroup } from "./procedures/assign-member-role-group";
import { createRoleGroup } from "./procedures/create-role-group";
import { deleteRoleGroup } from "./procedures/delete-role-group";
import { listAccessConfig } from "./procedures/list-access-config";
import { updateRoleGroup } from "./procedures/update-role-group";

export const workforceRouter = {
	listAccessConfig,
	createRoleGroup,
	updateRoleGroup,
	deleteRoleGroup,
	assignMemberRoleGroup,
};
