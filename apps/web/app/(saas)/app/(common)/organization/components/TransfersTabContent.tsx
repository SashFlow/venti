import { TabsContent } from "@repo/ui/tabs";
import { SectionCard, SwitchRow } from "./shared";

export function TransfersTabContent({
	toggles,
	updateToggle,
}: {
	toggles: Record<string, boolean>;
	updateToggle: (key: string, checked: boolean) => void;
}) {
	return (
		<TabsContent value="transfers" className="space-y-4">
			<SectionCard id="transfers" title="Transfers">
				<SwitchRow
					label="Enable transfers between warehouses"
					checked={toggles.transfers_enabled}
					onCheckedChange={(checked) => updateToggle("transfers_enabled", checked)}
				/>
				<SwitchRow
					label="Edit closed transfers"
					helpText="Allows post-close adjustments to transfer records."
					checked={toggles.transfers_editClosed}
					onCheckedChange={(checked) =>
						updateToggle("transfers_editClosed", checked)
					}
				/>
				<SwitchRow
					label="Enable bulk counting"
					helpText="Enables one-step receiving counts for transfers."
					checked={toggles.transfers_oneStepCheckIn}
					onCheckedChange={(checked) =>
						updateToggle("transfers_oneStepCheckIn", checked)
					}
				/>
				<SwitchRow
					label="Allow overcounting on transfers"
					helpText="Allows receiving quantities above expected transfer quantities."
					checked={toggles.transfers_enableOverCounting}
					onCheckedChange={(checked) =>
						updateToggle("transfers_enableOverCounting", checked)
					}
				/>
			</SectionCard>
		</TabsContent>
	);
}
