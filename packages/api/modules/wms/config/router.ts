import { getTenantConfig } from "./procedures/get-tenant-config";
import { updateTenantConfig } from "./procedures/update-tenant-config";

export const configRouter = {
	get: getTenantConfig,
	update: updateTenantConfig,
};
