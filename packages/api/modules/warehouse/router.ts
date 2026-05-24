import { createWarehouseProcedure } from "./procedures/create-warehouse";
import { deleteWarehouseProcedure } from "./procedures/delete-warehouse";
import { getCapacityWarningsProcedure } from "./procedures/get-capacity-warnings";
import { getLatestLayoutProcedure } from "./procedures/get-latest-layout";
import { getWarehouseProcedure } from "./procedures/get-warehouse";
import { listWarehousesProcedure } from "./procedures/list-warehouses";
import { createLocationProcedure } from "./procedures/locations/create-location";
import { deleteLocationProcedure } from "./procedures/locations/delete-location";
import { listLocationsProcedure } from "./procedures/locations/list-locations";
import { updateLocationHierarchyProcedure } from "./procedures/locations/update-location-hierarchy";
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
	locations: {
		list: listLocationsProcedure,
		create: createLocationProcedure,
		updateHierarchy: updateLocationHierarchyProcedure,
		delete: deleteLocationProcedure,
	},
	capacityWarnings: getCapacityWarningsProcedure,
};
