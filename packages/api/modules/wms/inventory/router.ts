import { listStockLevels } from "./procedures/list-stock-levels";
import { listStockLedger } from "./procedures/list-stock-ledger";
import { createSerialNumbers } from "./procedures/create-serial-numbers";
import { listSerialNumbers } from "./procedures/list-serial-numbers";
import { findSerialNumber } from "./procedures/find-serial-number";
import { updateSerialStatus } from "./procedures/update-serial-status";
import { createBatchLot } from "./procedures/create-batch-lot";
import { listBatchLots } from "./procedures/list-batch-lots";
import { findBatchLot } from "./procedures/find-batch-lot";
import { createPallet } from "./procedures/create-pallet";
import { listPallets } from "./procedures/list-pallets";
import { updatePalletLocation } from "./procedures/update-pallet-location";
import { createConsignment } from "./procedures/create-consignment";
import { listConsignment } from "./procedures/list-consignment";
import { consumeConsignment } from "./procedures/consume-consignment";

export const inventoryRouter = {
	stock: {
		list: listStockLevels,
	},
	ledger: {
		list: listStockLedger,
	},
	serials: {
		createBulk: createSerialNumbers,
		list: listSerialNumbers,
		find: findSerialNumber,
		updateStatus: updateSerialStatus,
	},
	batches: {
		create: createBatchLot,
		list: listBatchLots,
		find: findBatchLot,
	},
	pallets: {
		create: createPallet,
		list: listPallets,
		updateLocation: updatePalletLocation,
	},
	consignment: {
		create: createConsignment,
		list: listConsignment,
		consume: consumeConsignment,
	},
};
