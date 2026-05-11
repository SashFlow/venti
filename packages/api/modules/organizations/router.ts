import { createLogoUploadUrl } from "./procedures/create-logo-upload-url";
import { generateOrganizationSlug } from "./procedures/generate-organization-slug";
import { getOrganizationConfig } from "./procedures/get-organization-config";
import { upsertOrganizationConfig } from "./procedures/upsert-organization-config";

export const organizationsRouter = {
	generateSlug: generateOrganizationSlug,
	createLogoUploadUrl,
	getConfig: getOrganizationConfig,
	upsertConfig: upsertOrganizationConfig,
};
