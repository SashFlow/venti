import { completeUpload } from "./procedures/complete-upload";
import { createUploadUrl } from "./procedures/create-upload-url";

export const uploadsRouter = {
	createUploadUrl,
	completeUpload,
};
