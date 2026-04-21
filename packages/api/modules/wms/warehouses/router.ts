import { createWarehouse } from "./procedures/create-warehouse";
import { listWarehouses } from "./procedures/list-warehouses";
import { findWarehouse } from "./procedures/find-warehouse";
import { updateWarehouse } from "./procedures/update-warehouse";
import { createLevel } from "./procedures/create-level";
import { listLevels } from "./procedures/list-levels";
import { createZone } from "./procedures/create-zone";
import { listZones } from "./procedures/list-zones";
import { createAisle } from "./procedures/create-aisle";
import { listAisles } from "./procedures/list-aisles";
import { createBin } from "./procedures/create-bin";
import { listBins } from "./procedures/list-bins";

export const warehouseRouter = {
	create: createWarehouse,
	list: listWarehouses,
	find: findWarehouse,
	update: updateWarehouse,
	levels: {
		create: createLevel,
		list: listLevels,
	},
	zones: {
		create: createZone,
		list: listZones,
	},
	aisles: {
		create: createAisle,
		list: listAisles,
	},
	bins: {
		create: createBin,
		list: listBins,
	},
};
