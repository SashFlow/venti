import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/dialog";
import { TabsContent } from "@repo/ui/tabs";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	CURRENCY_OPTIONS,
	LENGTH_UNIT_OPTIONS,
	WEIGHT_UNIT_OPTIONS,
} from "./constants";
import { SectionCard, SelectRow } from "./shared";
import type { UnitOfMeasure } from "./UOMTable";
import { AddUOMForm, UOMTable } from "./UOMTable";

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
	const queryClient = useQueryClient();
	const { data: uoms = [] } = useQuery(
		orpc.masterData.uoms.list.queryOptions(),
	);

	const [showAdd, setShowAdd] = useState(false);

	const createMutation = useMutation({
		...orpc.masterData.uoms.create.mutationOptions(),
		onSuccess: () => {
			toast.success("Unit of Measure created");
			queryClient.invalidateQueries({
				queryKey: orpc.masterData.uoms.list.key(),
			});
			setShowAdd(false);
		},
		onError: (error: any) => {
			toast.error(`Failed to create: ${error.message}`);
		},
	});

	const updateMutation = useMutation({
		...orpc.masterData.uoms.update.mutationOptions(),
		onSuccess: () => {
			toast.success("Unit of Measure updated");
			queryClient.invalidateQueries({
				queryKey: orpc.masterData.uoms.list.key(),
			});
		},
		onError: (error: any) => {
			toast.error(`Failed to update: ${error.message}`);
		},
	});

	const deleteMutation = useMutation({
		...orpc.masterData.uoms.delete.mutationOptions(),
		onSuccess: () => {
			toast.success("Unit of Measure deleted");
			queryClient.invalidateQueries({
				queryKey: orpc.masterData.uoms.list.key(),
			});
		},
		onError: (error: any) => {
			toast.error(`Failed to delete: ${error.message}`);
		},
	});

	const handleAddUOM = (uom: Omit<UnitOfMeasure, "id">) => {
		createMutation.mutate(uom);
	};

	const handleUpdateUOM = (id: string, uom: Omit<UnitOfMeasure, "id">) => {
		updateMutation.mutate({ id, ...uom });
	};

	const handleDeleteUOM = (id: string) => {
		if (confirm("Are you sure you want to delete this Unit of Measure?")) {
			deleteMutation.mutate({ id });
		}
	};

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

			<SectionCard
				id="uom"
				title="Units of Measure"
				actions={
					<Dialog open={showAdd} onOpenChange={setShowAdd}>
						<DialogTrigger
							render={
								<button
									className="p-2 rounded-full hover:bg-gray-100"
									aria-label="Add UOM"
									type="button"
								/>
							}
						>
							<Plus className="h-5 w-5 text-primary" />
						</DialogTrigger>
						<DialogContent>
							<AddUOMForm
								onAdd={handleAddUOM}
								onClose={() => setShowAdd(false)}
							/>
						</DialogContent>
					</Dialog>
				}
			>
				<UOMTable
					uoms={uoms}
					onUpdate={handleUpdateUOM}
					onDelete={handleDeleteUOM}
				/>
			</SectionCard>
		</TabsContent>
	);
}
