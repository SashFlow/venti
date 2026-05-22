import { bulkUpdateOutboundStatusProcedure } from "./procedures/bulk-update-outbound-status";
import { bulkUpdateShipmentStatusesProcedure } from "./procedures/bulk-update-shipment-statuses";
import { completeTransferProcedure } from "./procedures/complete-transfer";
import { computeWaveRouteProcedure } from "./procedures/compute-wave-route";
import { confirmPickLineProcedure } from "./procedures/confirm-pick-line";
import { createPurchaseOrderProcedure } from "./procedures/create-purchase-order";
import { createSalesOrderProcedure } from "./procedures/create-sales-order";
import { createShipmentProcedure } from "./procedures/create-shipment";
import { createTransferProcedure } from "./procedures/create-transfer";
import { createWaveProcedure } from "./procedures/create-wave";
import { getPurchaseOrderProcedure } from "./procedures/get-purchase-order";
import { getSalesOrderProcedure } from "./procedures/get-sales-order";
import { getShipmentProcedure } from "./procedures/get-shipment";
import { getTransferProcedure } from "./procedures/get-transfer";
import { getPickListProcedure } from "./procedures/get-pick-list";
import { getWaveProcedure } from "./procedures/get-wave";
import { listFulfillmentBatchesProcedure } from "./procedures/list-fulfillment-batches";
import { listFulfillmentShipmentsProcedure } from "./procedures/list-fulfillment-shipments";
import { listInboundOrdersProcedure } from "./procedures/list-inbound-orders";
import { listManifestsProcedure } from "./procedures/list-manifests";
import { listOutboundOrdersProcedure } from "./procedures/list-outbound-orders";
import { listTransfersProcedure } from "./procedures/list-transfers";
import { updateOutboundOrderStatusProcedure } from "./procedures/update-outbound-order-status";
import { updateShipmentStatusProcedure } from "./procedures/update-shipment-status";

export const ordersRouter = {
	// List
	listInbound: listInboundOrdersProcedure,
	listOutbound: listOutboundOrdersProcedure,
	listTransfers: listTransfersProcedure,
	listManifests: listManifestsProcedure,
	listFulfillmentBatches: listFulfillmentBatchesProcedure,
	listFulfillmentShipments: listFulfillmentShipmentsProcedure,
	// Get by ID
	getPurchaseOrder: getPurchaseOrderProcedure,
	getSalesOrder: getSalesOrderProcedure,
	getTransfer: getTransferProcedure,
	getShipment: getShipmentProcedure,
	getWave: getWaveProcedure,
	// Create
	createPurchaseOrder: createPurchaseOrderProcedure,
	createSalesOrder: createSalesOrderProcedure,
	createTransfer: createTransferProcedure,
	createShipment: createShipmentProcedure,
	createWave: createWaveProcedure,
	// Status updates
	bulkUpdateOutboundStatus: bulkUpdateOutboundStatusProcedure,
	bulkUpdateShipmentStatuses: bulkUpdateShipmentStatusesProcedure,
	updateOutboundStatus: updateOutboundOrderStatusProcedure,
	completeTransfer: completeTransferProcedure,
	updateShipmentStatus: updateShipmentStatusProcedure,
	// Scanner – Pick List
	getPickList: getPickListProcedure,
	confirmPickLine: confirmPickLineProcedure,
	computeWaveRoute: computeWaveRouteProcedure,
};
