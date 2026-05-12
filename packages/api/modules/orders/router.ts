import { bulkUpdateOutboundStatusProcedure } from "./procedures/bulk-update-outbound-status";
import { bulkUpdateShipmentStatusesProcedure } from "./procedures/bulk-update-shipment-statuses";
import { completeTransferProcedure } from "./procedures/complete-transfer";
import { listFulfillmentBatchesProcedure } from "./procedures/list-fulfillment-batches";
import { listFulfillmentShipmentsProcedure } from "./procedures/list-fulfillment-shipments";
import { listInboundOrdersProcedure } from "./procedures/list-inbound-orders";
import { listManifestsProcedure } from "./procedures/list-manifests";
import { listOutboundOrdersProcedure } from "./procedures/list-outbound-orders";
import { listTransfersProcedure } from "./procedures/list-transfers";
import { updateOutboundOrderStatusProcedure } from "./procedures/update-outbound-order-status";
import { updateShipmentStatusProcedure } from "./procedures/update-shipment-status";

export const ordersRouter = {
	listInbound: listInboundOrdersProcedure,
	listOutbound: listOutboundOrdersProcedure,
	listTransfers: listTransfersProcedure,
	listManifests: listManifestsProcedure,
	listFulfillmentBatches: listFulfillmentBatchesProcedure,
	listFulfillmentShipments: listFulfillmentShipmentsProcedure,
	bulkUpdateOutboundStatus: bulkUpdateOutboundStatusProcedure,
	bulkUpdateShipmentStatuses: bulkUpdateShipmentStatusesProcedure,
	updateOutboundStatus: updateOutboundOrderStatusProcedure,
	completeTransfer: completeTransferProcedure,
	updateShipmentStatus: updateShipmentStatusProcedure,
};
