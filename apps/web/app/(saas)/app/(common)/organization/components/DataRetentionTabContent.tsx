import { TabsContent } from "@repo/ui/tabs";
import { InputRow, SectionCard } from "./shared";

export function DataRetentionTabContent({
	customersRetentionPeriod,
	setCustomersRetentionPeriod,
}: {
	customersRetentionPeriod: string;
	setCustomersRetentionPeriod: (value: string) => void;
}) {
	return (
		<TabsContent value="etc" className="space-y-4">
			<SectionCard id="etc" title="Data Retention">
				<InputRow
					label="Customer retention period (days)"
					helpText="Specifies the retention window used by cleanup and archival jobs."
					value={customersRetentionPeriod}
					onChange={setCustomersRetentionPeriod}
					placeholder="#"
					type="number"
					min={1}
					max={32767}
				/>
			</SectionCard>
		</TabsContent>
	);
}
