import { listMyPermissions } from "./permissions/list-my-permissions";
import { configRouter } from "./config/router";
import { warehouseRouter } from "./warehouses/router";
import { procurementRouter } from "./procurement/router";
import { supplierRouter } from "./suppliers/router";
import { customerRouter } from "./customers/router";
import { productRouter } from "./products/router";
import { qcRouter } from "./qc/router";
import { adjustmentRouter } from "./adjustments/router";
import { cycleCountRouter } from "./cycle-counts/router";
import { pickingRouter } from "./picking/router";
import { inventoryRouter } from "./inventory/router";
import { replenishmentRouter } from "./replenishment/router";

export const wmsRouter = {
	permissions: {
		me: listMyPermissions,
	},
	config: configRouter,
	warehouses: warehouseRouter,
	procurement: procurementRouter,
	suppliers: supplierRouter,
	customers: customerRouter,
	products: productRouter,
	qc: qcRouter,
	adjustments: adjustmentRouter,
	cycleCounts: cycleCountRouter,
	picking: pickingRouter,
	inventory: inventoryRouter,
	replenishment: replenishmentRouter,
};
