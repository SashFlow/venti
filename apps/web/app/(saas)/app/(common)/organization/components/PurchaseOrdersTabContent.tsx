import { TabsContent } from "@repo/ui/tabs";
import { InputRow, SectionCard, SwitchRow } from "./shared";

export function PurchaseOrdersTabContent({
	toggles,
	updateToggle,
	vendorsEmail,
	setVendorsEmail,
}: {
	toggles: Record<string, boolean>;
	updateToggle: (key: string, checked: boolean) => void;
	vendorsEmail: string;
	setVendorsEmail: (value: string) => void;
}) {
	return (
		<TabsContent value="po" className="space-y-4">
			<SectionCard id="po" title="Purchase Orders">
				<SwitchRow
					label="Enable purchase order management"
					checked={toggles.inventory_enablePurchaseOrders}
					onCheckedChange={(checked) =>
						updateToggle("inventory_enablePurchaseOrders", checked)
					}
				/>
				<InputRow
					label="PO email"
					helpText="Destination email for PO dispatch and vendor communication."
					value={vendorsEmail}
					onChange={setVendorsEmail}
					placeholder="name@example.com"
					type="email"
				/>
				<SwitchRow
					label="Enable check-in criteria"
					checked={toggles.checkin_enableBinCriteria}
					onCheckedChange={(checked) =>
						updateToggle("checkin_enableBinCriteria", checked)
					}
				/>
				<SwitchRow
					label="Enable bulk counting"
					helpText="Supports one-step check-in quantity operations."
					checked={toggles.po_oneStepCheckIn}
					onCheckedChange={(checked) => updateToggle("po_oneStepCheckIn", checked)}
				/>
				<SwitchRow
					label="Edit closed POs"
					helpText="Allows reopening or editing completed purchase orders."
					checked={toggles.po_editClosed}
					onCheckedChange={(checked) => updateToggle("po_editClosed", checked)}
				/>
			</SectionCard>
		</TabsContent>
	);
}
