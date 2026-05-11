import { TabsContent } from "@repo/ui/tabs";
import { SectionCard, SwitchRow } from "./shared";

export function CycleCountsTabContent({
	toggles,
	updateToggle,
}: {
	toggles: Record<string, boolean>;
	updateToggle: (key: string, checked: boolean) => void;
}) {
	return (
		<TabsContent value="cycle_counts" className="space-y-4">
			<SectionCard id="cycle_counts" title="Cycle Counts">
				<SwitchRow
					label="Enable cycle counting"
					checked={toggles.cycleCounts_enabled}
					onCheckedChange={(checked) =>
						updateToggle("cycleCounts_enabled", checked)
					}
				/>
				<SwitchRow
					label="Require bin scan"
					checked={toggles.cycleCounts_scanBin}
					onCheckedChange={(checked) =>
						updateToggle("cycleCounts_scanBin", checked)
					}
				/>
				<SwitchRow
					label="Require item scan"
					checked={toggles.cycleCounts_scanItem}
					onCheckedChange={(checked) =>
						updateToggle("cycleCounts_scanItem", checked)
					}
				/>
				<SwitchRow
					label="Show expected quantity in bin"
					checked={toggles.cycleCounts_showQty}
					onCheckedChange={(checked) =>
						updateToggle("cycleCounts_showQty", checked)
					}
				/>
			</SectionCard>
		</TabsContent>
	);
}
