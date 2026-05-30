import { dispatchTransferProcedure } from "./procedures/dispatch-transfer";
import { receiveTransferProcedure } from "./procedures/receive-transfer";
import { calculateHoldingCostsProcedure } from "./procedures/calculate-holding-costs";
import { adjustInventoryProcedure } from "./procedures/adjust-inventory";
import { getInventoryTimelineProcedure } from "./procedures/get-inventory-timeline";
import { listInventoryBalancesProcedure } from "./procedures/list-inventory-balances";

export const inventoryRouter = {
        dispatchTransfer: dispatchTransferProcedure,
        receiveTransfer: receiveTransferProcedure,
        calculateHoldingCosts: calculateHoldingCostsProcedure,
	balances: listInventoryBalancesProcedure,
	timeline: getInventoryTimelineProcedure,
	adjust: adjustInventoryProcedure,
};
