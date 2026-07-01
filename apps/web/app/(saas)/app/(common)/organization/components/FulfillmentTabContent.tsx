import { TabsContent } from "@repo/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { CollapsibleGroup, InputRow, SectionCard, SwitchRow } from "./shared";

export function FulfillmentTabContent({
	toggles,
	updateToggle,
	ignoreLineItemProperties,
	setIgnoreLineItemProperties,
	fulfillmentLabelHeader,
	setFulfillmentLabelHeader,
	fulfillmentLabelFooter,
	setFulfillmentLabelFooter,
	printerName,
	setPrinterName,
	printerIp,
	setPrinterIp,
	printerType,
	setPrinterType,
}: {
	toggles: Record<string, boolean>;
	updateToggle: (key: string, checked: boolean) => void;
	ignoreLineItemProperties: string;
	setIgnoreLineItemProperties: (value: string) => void;
	fulfillmentLabelHeader: string;
	setFulfillmentLabelHeader: (value: string) => void;
	fulfillmentLabelFooter: string;
	setFulfillmentLabelFooter: (value: string) => void;
	printerName: string;
	setPrinterName: (value: string) => void;
	printerIp: string;
	setPrinterIp: (value: string) => void;
	printerType: string;
	setPrinterType: (value: string) => void;
}) {
	return (
		<TabsContent value="fulfillment" className="space-y-4">
			<SectionCard id="fulfillment" title="Fulfillment">
				<SwitchRow
					label="Allow shipments to be marked as fulfilled"
					description="Allow fulfillment without requiring carrier label purchase, such as in-store pickup and local delivery."
					checked={toggles.outbound_markShipmentAsFulfilled}
					onCheckedChange={(checked) =>
						updateToggle(
							"outbound_markShipmentAsFulfilled",
							checked,
						)
					}
				/>
				<SwitchRow
					label="Notify customer when fulfilled"
					description="Send fulfillment notifications through Shopify."
					checked={toggles.batch_notifyCustomerFulfilled}
					onCheckedChange={(checked) =>
						updateToggle("batch_notifyCustomerFulfilled", checked)
					}
				/>
				<SwitchRow
					label="Use default Shopify tracking page"
					checked={toggles.batch_useShopifyTrackingPage}
					onCheckedChange={(checked) =>
						updateToggle("batch_useShopifyTrackingPage", checked)
					}
				/>
				<SwitchRow
					label="Create barcodes for batches"
					checked={toggles.batch_generateBarcodes}
					onCheckedChange={(checked) =>
						updateToggle("batch_generateBarcodes", checked)
					}
				/>
				<SwitchRow
					label="Allow partial fulfillment of orders"
					checked={toggles.batch_partialFulfillment}
					onCheckedChange={(checked) =>
						updateToggle("batch_partialFulfillment", checked)
					}
				/>
				<SwitchRow
					label="Allow printing pick slips"
					helpText="Allows printing at the pick stage for paper-assisted workflows."
					checked={toggles.batch_printPickSlip}
					onCheckedChange={(checked) =>
						updateToggle("batch_printPickSlip", checked)
					}
				/>
				<SwitchRow
					label="Allow bulk packing all items"
					helpText="Packs all picked line items into shipment with one action."
					checked={toggles.batch_packAll}
					onCheckedChange={(checked) =>
						updateToggle("batch_packAll", checked)
					}
				/>
				<SwitchRow
					label="Print license plate when packing completes"
					helpText="Prints a shipment license plate label after pack confirmation."
					checked={toggles.batch_printLicensePlate}
					onCheckedChange={(checked) =>
						updateToggle("batch_printLicensePlate", checked)
					}
				/>

				<InputRow
					label="Ignore line item properties"
					helpText="Comma-separated patterns ignored when matching line item properties."
					value={ignoreLineItemProperties}
					onChange={setIgnoreLineItemProperties}
					placeholder="Ignore pattern"
				/>

				<CollapsibleGroup title="Label Messages">
					<p className="text-muted-foreground text-sm">
						Configure dynamic label message templates for different
						shipment states and carrier actions.
					</p>
					<div className="grid gap-3 md:grid-cols-2">
						<InputRow
							label="Header message"
							value={fulfillmentLabelHeader}
							onChange={setFulfillmentLabelHeader}
							placeholder="Optional header"
						/>
						<InputRow
							label="Footer message"
							value={fulfillmentLabelFooter}
							onChange={setFulfillmentLabelFooter}
							placeholder="Optional footer"
						/>
					</div>
				</CollapsibleGroup>
			</SectionCard>

			<SectionCard id="connected-devices" title="Connected devices">
				<p className="text-sm text-muted-foreground mb-3">
					Placeholder printer config for pick lists and shipping labels
					(no live socket in POC).
				</p>
				<div className="grid gap-3 md:grid-cols-2">
					<InputRow
						label="Printer name"
						value={printerName}
						onChange={setPrinterName}
						placeholder="Dock 3 Zebra"
					/>
					<InputRow
						label="Printer IP"
						value={printerIp}
						onChange={setPrinterIp}
						placeholder="192.168.1.50"
					/>
				</div>
				<div className="mt-3 max-w-xs">
					<p className="text-sm font-medium mb-1.5">Printer type</p>
					<Select
						value={printerType}
						onValueChange={(value) => {
							if (value) {
								setPrinterType(value);
							}
						}}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ZEBRA">Zebra</SelectItem>
							<SelectItem value="BROTHER">Brother</SelectItem>
							<SelectItem value="GENERIC">Generic</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</SectionCard>
		</TabsContent>
	);
}
