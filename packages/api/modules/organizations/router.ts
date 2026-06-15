import { createLogoUploadUrl } from "./procedures/create-logo-upload-url";
import { generateOrganizationSlug } from "./procedures/generate-organization-slug";
import { getOrganizationConfig } from "./procedures/get-organization-config";
import { listAuditLogsProcedure } from "./procedures/list-audit-logs";
import { resetDemoProcedure } from "./procedures/reset-demo";
import { upsertOrganizationConfig } from "./procedures/upsert-organization-config";

export const organizationsRouter = {
	generateSlug: generateOrganizationSlug,
	createLogoUploadUrl,
	getConfig: getOrganizationConfig,
	upsertConfig: upsertOrganizationConfig,
	listAuditLogs: listAuditLogsProcedure,
	resetDemo: resetDemoProcedure,
};
