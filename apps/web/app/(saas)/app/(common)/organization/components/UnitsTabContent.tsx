import { TabsContent } from "@repo/ui/tabs";
import {
	CURRENCY_OPTIONS,
	LENGTH_UNIT_OPTIONS,
	WEIGHT_UNIT_OPTIONS,
} from "./constants";
import { SectionCard, SelectRow } from "./shared";

export function UnitsTabContent({
	itemsDefaultLengthUnit,
	setItemsDefaultLengthUnit,
	itemsDefaultWeightUnit,
	setItemsDefaultWeightUnit,
	displayCurrency,
	setDisplayCurrency,
}: {
	itemsDefaultLengthUnit: string;
	setItemsDefaultLengthUnit: (value: string) => void;
	itemsDefaultWeightUnit: string;
	setItemsDefaultWeightUnit: (value: string) => void;
	displayCurrency: string;
	setDisplayCurrency: (value: string) => void;
}) {
	return (
		<TabsContent value="units" className="space-y-4">
			<SectionCard id="units" title="Units">
				<SelectRow
					label="Default length unit"
					value={itemsDefaultLengthUnit}
					onValueChange={setItemsDefaultLengthUnit}
					options={LENGTH_UNIT_OPTIONS}
				/>
				<SelectRow
					label="Default weight unit"
					value={itemsDefaultWeightUnit}
					onValueChange={setItemsDefaultWeightUnit}
					options={WEIGHT_UNIT_OPTIONS}
				/>
				<SelectRow
					label="Display currency"
					helpText="Controls currency formatting in operational screens."
					value={displayCurrency}
					onValueChange={setDisplayCurrency}
					options={CURRENCY_OPTIONS}
				/>
			</SectionCard>
		</TabsContent>
	);
}
