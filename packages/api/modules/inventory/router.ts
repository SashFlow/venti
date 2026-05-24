import { adjustInventoryProcedure } from "./procedures/adjust-inventory";
import { getInventoryTimelineProcedure } from "./procedures/get-inventory-timeline";
import { listInventoryBalancesProcedure } from "./procedures/list-inventory-balances";

export const inventoryRouter = {
	balances: listInventoryBalancesProcedure,
	timeline: getInventoryTimelineProcedure,
	adjust: adjustInventoryProcedure,
};
