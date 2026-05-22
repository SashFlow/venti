import { confirmInboundReceiptProcedure } from "./procedures/confirm-inbound-receipt";
import { confirmPutawayProcedure } from "./procedures/confirm-putaway";
import { confirmTransferPickProcedure } from "./procedures/confirm-transfer-pick";
import { createWarehouseProcedure } from "./procedures/create-warehouse";
import { deleteWarehouseProcedure } from "./procedures/delete-warehouse";
import { executeBinMoveProcedure } from "./procedures/execute-bin-move";
import { getBinContentsProcedure } from "./procedures/get-bin-contents";
import { getLatestLayoutProcedure } from "./procedures/get-latest-layout";
import { getWarehouseProcedure } from "./procedures/get-warehouse";
import { listWarehousesProcedure } from "./procedures/list-warehouses";
import { publishLayoutVersionProcedure } from "./procedures/publish-layout-version";
import { restoreWarehouseProcedure } from "./procedures/restore-warehouse";
import { saveLayoutDraftProcedure } from "./procedures/save-layout-draft";
import { scanInboundItemProcedure } from "./procedures/scan-inbound-item";
import { scanItemLookupProcedure } from "./procedures/scan-item-lookup";
import { suggestPutawayLocationProcedure } from "./procedures/suggest-putaway-location";
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
	// Scanner
	scanner: {
		getBinContents: getBinContentsProcedure,
		executeBinMove: executeBinMoveProcedure,
		scanInboundItem: scanInboundItemProcedure,
		confirmInboundReceipt: confirmInboundReceiptProcedure,
		suggestPutawayLocation: suggestPutawayLocationProcedure,
		confirmPutaway: confirmPutawayProcedure,
		scanItemLookup: scanItemLookupProcedure,
		confirmTransferPick: confirmTransferPickProcedure,
	},
};
