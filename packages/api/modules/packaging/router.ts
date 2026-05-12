import { createPackageTypeProcedure } from "./procedures/create-package-type";
import { deletePackageTypeProcedure } from "./procedures/delete-package-type";
import { getPackageTypeProcedure } from "./procedures/get-package-type";
import { listPackageTypesProcedure } from "./procedures/list-package-types";
import { updatePackageTypeProcedure } from "./procedures/update-package-type";

export const packagingRouter = {
	list: listPackageTypesProcedure,
	get: getPackageTypeProcedure,
	create: createPackageTypeProcedure,
	update: updatePackageTypeProcedure,
	delete: deletePackageTypeProcedure,
};
