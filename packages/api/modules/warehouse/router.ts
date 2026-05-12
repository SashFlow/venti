import { createWarehouseProcedure } from "./procedures/create-warehouse";
import { deleteWarehouseProcedure } from "./procedures/delete-warehouse";
import { getLatestLayoutProcedure } from "./procedures/get-latest-layout";
import { getWarehouseProcedure } from "./procedures/get-warehouse";
import { listWarehousesProcedure } from "./procedures/list-warehouses";
import { publishLayoutVersionProcedure } from "./procedures/publish-layout-version";
import { restoreWarehouseProcedure } from "./procedures/restore-warehouse";
import { saveLayoutDraftProcedure } from "./procedures/save-layout-draft";
import { updateWarehouseProcedure } from "./procedures/update-warehouse";

export const warehouseRouter = {
	list: listWarehousesProcedure,
	create: createWarehouseProcedure,
	get: getWarehouseProcedure,
	update: updateWarehouseProcedure,
	delete: deleteWarehouseProcedure,
	restore: restoreWarehouseProcedure,
	layout: {
		getLatest: getLatestLayoutProcedure,
		saveDraft: saveLayoutDraftProcedure,
		publish: publishLayoutVersionProcedure,
	},
};
