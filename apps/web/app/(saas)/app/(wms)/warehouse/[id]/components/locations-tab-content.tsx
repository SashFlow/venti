"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { TabsContent } from "@repo/ui/tabs";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronRightIcon,
	GripVerticalIcon,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Location = {
	id: string;
	code: string;
	name: string | null;
	type: string;
	parentLocationId: string | null;
	sequence: number | null;
};

function SortableLocationItem({
	location,
	onSelect,
	onDelete,
	isSelected,
}: {
	location: Location;
	onSelect: (location: Location) => void;
	onDelete: (id: string) => void;
	isSelected: boolean;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: location.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-2 rounded-md border p-2 shadow-sm transition-colors ${
				isSelected ? "border-primary bg-primary/5" : "bg-card"
			} ${isDragging ? "opacity-50" : ""}`}
		>
			<div
				{...attributes}
				{...listeners}
				className="cursor-grab p-1 hover:text-primary active:cursor-grabbing"
			>
				<GripVerticalIcon className="size-4 text-muted-foreground" />
			</div>
			<button
				type="button"
				className="flex-1 cursor-pointer text-left"
				onClick={() => onSelect(location)}
			>
				<div className="flex items-center justify-between">
					<div>
						<span className="font-medium">{location.code}</span>
						{location.name ? (
							<span className="ml-2 text-xs text-muted-foreground">
								({location.name})
							</span>
						) : null}
					</div>
					<div className="flex items-center gap-3">
						<span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold tracking-wider text-secondary-foreground">
							{location.type}
						</span>
						<ChevronRightIcon className="size-4 text-muted-foreground" />
					</div>
				</div>
			</button>
			<Button
				variant="ghost"
				size="icon"
				className="size-8 text-destructive hover:bg-destructive/10"
				onClick={(e) => {
					e.stopPropagation();
					onDelete(location.id);
				}}
			>
				<TrashIcon className="size-4" />
			</Button>
		</div>
	);
}

export function LocationsTabContent(props: {
	warehouseId: string;
	organizationId: string;
}) {
	return (
		<TabsContent value="locations" className="space-y-4">
			<LocationsTab {...props} />
		</TabsContent>
	);
}

function LocationsTab({
	warehouseId,
	organizationId,
}: {
	warehouseId: string;
	organizationId: string;
}) {
	const queryClient = useQueryClient();
	const [parentPath, setParentPath] = useState<Location[]>([]);
	const [newCode, setNewCode] = useState("");
	const [newName, setNewName] = useState("");
	const [newType, setNewType] = useState<string>("ZONE");

	const parentId =
		parentPath.length > 0 ? parentPath[parentPath.length - 1].id : null;

	const { data: locations = [], isPending } = useQuery({
		...orpc.warehouse.locations.list.queryOptions({
			input: { organizationId, warehouseId },
		}),
		select: (data) => data as Location[],
	});

	const createMutation = useMutation(
		orpc.warehouse.locations.create.mutationOptions(),
	);
	const updateHierarchyMutation = useMutation(
		orpc.warehouse.locations.updateHierarchy.mutationOptions(),
	);
	const deleteMutation = useMutation(
		orpc.warehouse.locations.delete.mutationOptions(),
	);

	const visibleLocations = useMemo(() => {
		return locations
			.filter((loc) => loc.parentLocationId === parentId)
			.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
	}, [locations, parentId]);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
	);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = visibleLocations.findIndex(
				(loc) => loc.id === active.id,
			);
			const newIndex = visibleLocations.findIndex(
				(loc) => loc.id === over.id,
			);

			const newLocations = arrayMove(
				visibleLocations,
				oldIndex,
				newIndex,
			);

			const updates = newLocations.map((loc, index) => ({
				id: loc.id,
				parentLocationId: loc.parentLocationId,
				sequence: index,
			}));

			// Optimistic UI could be implemented here, but we'll just mutate and invalidate for now
			await updateHierarchyMutation.mutateAsync({
				organizationId,
				warehouseId,
				updates,
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.warehouse.locations.list.key(),
			});
		}
	};

	const handleCreate = async () => {
		if (!newCode.trim()) {
			toast.error("Location code is required");
			return;
		}

		await createMutation.mutateAsync({
			organizationId,
			warehouseId,
			parentLocationId: parentId ?? undefined,
			code: newCode.trim(),
			name: newName.trim() || undefined,
			type: newType as any,
		});

		setNewCode("");
		setNewName("");
		toast.success("Location created");

		await queryClient.invalidateQueries({
			queryKey: orpc.warehouse.locations.list.key(),
		});
	};

	const handleDelete = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this location? All child locations will be affected.",
			)
		) {
			return;
		}

		await deleteMutation.mutateAsync({
			organizationId,
			warehouseId,
			locationId: id,
		});

		toast.success("Location deleted");

		await queryClient.invalidateQueries({
			queryKey: orpc.warehouse.locations.list.key(),
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Location Hierarchy
				</h2>
			</div>

			<Card className="border">
				<CardHeader className="border-b px-4 py-3 bg-muted/20">
					<div className="flex items-center gap-2 text-sm">
						<button
							type="button"
							className="font-medium hover:underline text-muted-foreground"
							onClick={() => setParentPath([])}
						>
							Warehouse Root
						</button>
						{parentPath.map((loc, index) => (
							<div
								key={loc.id}
								className="flex items-center gap-2"
							>
								<ChevronRightIcon className="size-4 text-muted-foreground" />
								<button
									type="button"
									className={`hover:underline ${
										index === parentPath.length - 1
											? "font-semibold text-foreground"
											: "font-medium text-muted-foreground"
									}`}
									onClick={() =>
										setParentPath(
											parentPath.slice(0, index + 1),
										)
									}
								>
									{loc.code}
								</button>
							</div>
						))}
					</div>
				</CardHeader>
				<CardContent className="p-4 grid gap-6 md:grid-cols-2">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium">Locations</h3>
						</div>
						{isPending ? (
							<p className="text-sm text-muted-foreground">
								Loading...
							</p>
						) : visibleLocations.length === 0 ? (
							<div className="rounded-md border border-dashed p-8 text-center">
								<p className="text-sm text-muted-foreground">
									No locations found here. Add one below.
								</p>
							</div>
						) : (
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={visibleLocations.map((l) => l.id)}
									strategy={verticalListSortingStrategy}
								>
									<div className="space-y-2">
										{visibleLocations.map((loc) => (
											<SortableLocationItem
												key={loc.id}
												location={loc}
												isSelected={false}
												onSelect={(l) =>
													setParentPath((prev) => [
														...prev,
														l,
													])
												}
												onDelete={handleDelete}
											/>
										))}
									</div>
								</SortableContext>
							</DndContext>
						)}
					</div>

					<div className="space-y-4 rounded-md border p-4 bg-muted/10 h-fit">
						<h3 className="text-sm font-medium">
							Add New Location
						</h3>
						<div className="space-y-3">
							<div className="space-y-1">
								<label
									htmlFor="new-location-code"
									className="text-xs font-medium"
								>
									Code
								</label>
								<Input
									id="new-location-code"
									placeholder="e.g. A1, R1, B1"
									value={newCode}
									onChange={(e) => setNewCode(e.target.value)}
								/>
							</div>
							<div className="space-y-1">
								<label
									htmlFor="new-location-name"
									className="text-xs font-medium"
								>
									Name (Optional)
								</label>
								<Input
									id="new-location-name"
									placeholder="e.g. North Zone"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
								/>
							</div>
							<div className="space-y-1">
								<label
									htmlFor="new-location-type"
									className="text-xs font-medium"
								>
									Type
								</label>
								<Select
									value={newType}
									onValueChange={(val) => {
										if (val) {
											setNewType(val);
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select type">
											{newType === "ZONE"
												? "Zone"
												: newType === "AISLE"
													? "Aisle"
													: newType === "RACK"
														? "Rack"
														: newType === "SHELF"
															? "Shelf"
															: newType === "BIN"
																? "Bin"
																: newType ===
																		"STAGING"
																	? "Staging"
																	: "Select type"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ZONE">
											Zone
										</SelectItem>
										<SelectItem value="AISLE">
											Aisle
										</SelectItem>
										<SelectItem value="RACK">
											Rack
										</SelectItem>
										<SelectItem value="SHELF">
											Shelf
										</SelectItem>
										<SelectItem value="BIN">Bin</SelectItem>
										<SelectItem value="STAGING">
											Staging
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Button
								className="w-full"
								onClick={handleCreate}
								disabled={createMutation.isPending}
							>
								<PlusIcon className="mr-2 size-4" />
								Add Location
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
