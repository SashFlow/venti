import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { TabsContent } from "@repo/ui/tabs";
import { ABC_VALUATION_OPTIONS } from "./constants";
import {
	CollapsibleGroup,
	HelpTip,
	InputRow,
	SectionCard,
	SwitchRow,
} from "./shared";

export function InventoryTabContent({
	toggles,
	updateToggle,
	inventoryAdjustmentReasons,
	setInventoryAdjustmentReasons,
	abcValuationMethod,
	setAbcValuationMethod,
}: {
	toggles: Record<string, boolean>;
	updateToggle: (key: string, checked: boolean) => void;
	inventoryAdjustmentReasons: string;
	setInventoryAdjustmentReasons: (value: string) => void;
	abcValuationMethod: string;
	setAbcValuationMethod: (value: string) => void;
}) {
	return (
		<TabsContent value="inventory" className="space-y-4">
			<SectionCard id="inventory" title="Inventory">
				<InputRow
					label="Adjustment reasons"
					value={inventoryAdjustmentReasons}
					onChange={setInventoryAdjustmentReasons}
					placeholder="New reason"
				/>
				<SwitchRow
					label="Enable bin to bin replenishment"
					helpText="Allows internal replenishment transfers between bins."
					checked={toggles.inventory_enableInternalReplenishment}
					onCheckedChange={(checked) =>
						updateToggle(
							"inventory_enableInternalReplenishment",
							checked,
						)
					}
				/>
				<SwitchRow
					label="Enable kitting"
					helpText="Allows assembling and disassembling kit SKUs."
					checked={toggles.inventory_enableKitting}
					onCheckedChange={(checked) =>
						updateToggle("inventory_enableKitting", checked)
					}
				/>
				<SwitchRow
					label="Track packaging inventory"
					helpText="Includes cartons and packaging supplies in stock records."
					checked={toggles.inventory_packaging}
					onCheckedChange={(checked) =>
						updateToggle("inventory_packaging", checked)
					}
				/>
				<SwitchRow
					label="Retain empty records"
					helpText="Keeps zero-stock records for reporting continuity."
					checked={toggles.inventory_retainEmptyRecords}
					onCheckedChange={(checked) =>
						updateToggle("inventory_retainEmptyRecords", checked)
					}
				/>
				<SwitchRow
					label="Require adjustment reason"
					checked={toggles.inventory_adjustmentReasonRequired}
					onCheckedChange={(checked) =>
						updateToggle(
							"inventory_adjustmentReasonRequired",
							checked,
						)
					}
				/>
				<SwitchRow
					label="Enable serialized inventory"
					checked={toggles.inventory_enableSerialization}
					onCheckedChange={(checked) =>
						updateToggle("inventory_enableSerialization", checked)
					}
				/>
				<SwitchRow
					label="Enable expiration and lot tracking"
					checked={toggles.inventory_enableExpirationTracking}
					onCheckedChange={(checked) =>
						updateToggle(
							"inventory_enableExpirationTracking",
							checked,
						)
					}
				/>
				<SwitchRow
					label="Prioritize lot expiration ranges during picking"
					checked={toggles.inventory_enableLotClassifications}
					onCheckedChange={(checked) =>
						updateToggle(
							"inventory_enableLotClassifications",
							checked,
						)
					}
				/>
				<SwitchRow
					label="Limit one lot per item per bin"
					helpText="Prevents mixing multiple lots for the same item in a single bin."
					checked={toggles.inventory_oneLotPerBin}
					onCheckedChange={(checked) =>
						updateToggle("inventory_oneLotPerBin", checked)
					}
				/>
				<SwitchRow
					label="Show lot expirations as date"
					description="Example: 5/6/2026"
					checked={toggles.inventory_expirationAsDate}
					onCheckedChange={(checked) =>
						updateToggle("inventory_expirationAsDate", checked)
					}
				/>

				<CollapsibleGroup title="ABC Analysis">
					<SwitchRow
						label="Enable ABC analysis"
						helpText="Classifies SKUs by movement and supports slotting strategies."
						checked={toggles.inventory_abc_enabled}
						onCheckedChange={(checked) =>
							updateToggle("inventory_abc_enabled", checked)
						}
					/>

					<div className="space-y-5 rounded-lg border bg-muted/10 p-4">
						<div className="overflow-hidden rounded-md border bg-background">
							<div className="grid grid-cols-[15fr_40fr_45fr] text-center font-semibold text-sm text-white">
								<div className="bg-linear-to-r from-emerald-400 to-lime-400 px-2 py-2">
									A: 15
								</div>
								<div className="border-x border-background/70 bg-linear-to-r from-lime-500 to-amber-500 px-2 py-2">
									B: 40
								</div>
								<div className="bg-linear-to-r from-amber-500 to-orange-500 px-2 py-2">
									C: 45
								</div>
							</div>
						</div>

						<div className="grid gap-3 md:grid-cols-[1fr_400px] md:items-center">
							<div className="flex items-center gap-2">
								<p className="font-semibold text-sm">
									Valuation Method
								</p>
								<HelpTip text="Choose which value metric should drive A/B/C ranking." />
							</div>
							<Select
								value={abcValuationMethod}
								onValueChange={(nextValue) =>
									setAbcValuationMethod(nextValue ?? "")
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select valuation method">
										{ABC_VALUATION_OPTIONS.find(
											(o) =>
												o.value === abcValuationMethod,
										)?.label ?? "Select valuation method"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{ABC_VALUATION_OPTIONS.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CollapsibleGroup>

				<SwitchRow
					label="Enable cost tracking"
					helpText="Enables inventory valuation and cost-aware operational reports."
					checked={toggles.inventory_enableCostTracking}
					onCheckedChange={(checked) =>
						updateToggle("inventory_enableCostTracking", checked)
					}
				/>
			</SectionCard>
		</TabsContent>
	);
}
