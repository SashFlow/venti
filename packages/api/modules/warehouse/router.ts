import { createWarehouseProcedure } from "./procedures/create-warehouse";
import { deleteWarehouseProcedure } from "./procedures/delete-warehouse";
import { getCapacityWarningsProcedure } from "./procedures/get-capacity-warnings";

import { getWarehouseProcedure } from "./procedures/get-warehouse";
import { listWarehousesProcedure } from "./procedures/list-warehouses";
import { createLocationProcedure } from "./procedures/locations/create-location";
import { deleteLocationProcedure } from "./procedures/locations/delete-location";
import { listLocationsProcedure } from "./procedures/locations/list-locations";
import { updateLocationHierarchyProcedure } from "./procedures/locations/update-location-hierarchy";

import { restoreWarehouseProcedure } from "./procedures/restore-warehouse";

import { updateWarehouseProcedure } from "./procedures/update-warehouse";
import { saveLayoutProcedure } from "./procedures/layout/save-layout";
import { loadLayoutProcedure } from "./procedures/layout/load-layout";

export const warehouseRouter = {
	list: listWarehousesProcedure,
	create: createWarehouseProcedure,
	get: getWarehouseProcedure,
	update: updateWarehouseProcedure,
	delete: deleteWarehouseProcedure,
	restore: restoreWarehouseProcedure,
	locations: {
		list: listLocationsProcedure,
		create: createLocationProcedure,
		updateHierarchy: updateLocationHierarchyProcedure,
		delete: deleteLocationProcedure,
	},
	capacityWarnings: getCapacityWarningsProcedure,
	layout: {
		save: saveLayoutProcedure,
		load: loadLayoutProcedure,
	},
};
