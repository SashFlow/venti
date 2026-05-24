"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisIcon,
	InfoIcon,
	PlusIcon,
	SearchIcon,
	ShareIcon,
	Trash2Icon,
	UploadIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Warehouse3DScene } from "./warehouse-3d-scene";

const FILTER_BUTTON_CLASS =
	"h-8 rounded-md border border-input bg-muted/40 px-3 text-xs font-semibold text-foreground/80";

function Pager() {
	return (
		<div className="ml-auto flex items-center gap-1">
			<Button
				variant="outline"
				size="icon"
				className="size-8"
				aria-label="Prev page"
			>
				<ChevronLeftIcon className="size-4" />
			</Button>
			<span className="px-1 text-xs font-medium">1</span>
			<Button
				variant="outline"
				size="icon"
				className="size-8"
				aria-label="Next page"
			>
				<ChevronRightIcon className="size-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				className="size-8"
				aria-label="More actions"
			>
				<EllipsisIcon className="size-4" />
			</Button>
		</div>
	);
}

type WarehouseSettingsFormValues = {
	name: string;
	code: string;
	timezone: string;
};

function SettingsTab({
	values,
	onChange,
	onSave,
	onDelete,
	onRestore,
	saving,
	deleting,
	restoring,
	readOnly,
}: {
	values: WarehouseSettingsFormValues;
	onChange: (patch: Partial<WarehouseSettingsFormValues>) => void;
	onSave: () => void;
	onDelete: () => void;
	onRestore?: () => void;
	saving: boolean;
	deleting: boolean;
	restoring?: boolean;
	readOnly?: boolean;
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Warehouse
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Archive warehouse"
						onClick={onDelete}
						disabled={deleting || readOnly}
					>
						<Trash2Icon className="size-4" />
					</Button>
					{readOnly ? (
						<Button
							variant="outline"
							size="sm"
							onClick={onRestore}
							disabled={restoring}
						>
							{restoring ? "Restoring..." : "Restore"}
						</Button>
					) : null}
					<Button
						size="sm"
						onClick={onSave}
						disabled={saving || readOnly}
					>
						{saving ? "Saving..." : "Save"}
					</Button>
				</div>
			</div>

			{readOnly ? (
				<p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
					This warehouse is archived and currently read-only. Restore
					it to edit settings.
				</p>
			) : null}

			<div
				className={
					readOnly ? "pointer-events-none opacity-70" : undefined
				}
			>
				<Card className="border">
					<CardContent className="space-y-4 p-4">
						<div className="grid gap-4 md:grid-cols-[1fr_110px]">
							<div className="space-y-1.5">
								<Label htmlFor="warehouse-name">
									Name{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Input
									id="warehouse-name"
									value={values.name}
									onChange={(event) => {
										onChange({ name: event.target.value });
									}}
								/>
							</div>
							<div className="space-y-1.5">
								<div className="flex items-center gap-1">
									<Label htmlFor="warehouse-prefix">
										Prefix{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<InfoIcon className="size-3.5 text-muted-foreground" />
								</div>
								<Input
									id="warehouse-prefix"
									value={values.code}
									onChange={(event) => {
										onChange({ code: event.target.value });
									}}
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="warehouse-timezone">Timezone</Label>
							<Input
								id="warehouse-timezone"
								value={values.timezone}
								onChange={(event) => {
									onChange({ timezone: event.target.value });
								}}
								placeholder="UTC"
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function InventoryTab({
	warehouseId,
	organizationId,
}: {
	warehouseId: string;
	organizationId: string;
}) {
	const { data: balances = [], isPending } = useQuery({
		...orpc.inventory.balances.queryOptions({
			input: { organizationId, warehouseId, limit: 20 },
		}),
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Inventory
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Share inventory"
					>
						<ShareIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Export inventory"
					>
						<UploadIcon className="size-4" />
					</Button>
					<Button size="sm">Adjust</Button>
				</div>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="border-b px-4 py-2 text-xs font-semibold">
						No Filters
					</div>
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-sm">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Search" className="h-8 pl-9" />
						</div>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Product Type
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Product Tags
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							$
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							{"> Price"}
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							$
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							{"< Price"}
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Any ABC Class
						</Button>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead>Serial</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Lot</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>State</TableHead>
								<TableHead>Unit Cost</TableHead>
								<TableHead>ABC</TableHead>
								<TableHead className="text-right">
									Qty
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending ? (
								<TableRow>
									<TableCell
										colSpan={9}
										className="text-center py-6 text-muted-foreground"
									>
										Loading inventory...
									</TableCell>
								</TableRow>
							) : balances.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={9}
										className="text-center py-6 text-muted-foreground"
									>
										No inventory found in this warehouse.
									</TableCell>
								</TableRow>
							) : (
								balances.map((balance: any) => (
									<TableRow key={balance.id}>
										<TableCell className="font-medium">
											{balance.sku.name}
										</TableCell>
										<TableCell>
											{balance.sku.barcode ?? "-"}
										</TableCell>
										<TableCell>
											{balance.sku.code}
										</TableCell>
										<TableCell>
											{balance.lot?.code ?? "-"}
										</TableCell>
										<TableCell className="underline underline-offset-2">
											{balance.location.code}
										</TableCell>
										<TableCell>{balance.state}</TableCell>
										<TableCell>-</TableCell>
										<TableCell>-</TableCell>
										<TableCell className="text-right">
											{Number(
												balance.quantityAvailable,
											).toFixed(2)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function ReplenishInventoryTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Replenish Inventory
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Export replenishments"
					>
						<UploadIcon className="size-4" />
					</Button>
					<Button size="sm">Create</Button>
				</div>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-2xl">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Filter" className="h-8 pl-9" />
						</div>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							All
						</Button>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead>Vendor(s)</TableHead>
								<TableHead>Source</TableHead>
								<TableHead>Sales/Day</TableHead>
								<TableHead>Inventory</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody />
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function BinReplenishmentTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Bin Replenishment
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Export bin replenishments"
					>
						<UploadIcon className="size-4" />
					</Button>
					<Button size="sm">Create</Button>
				</div>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-xs">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Filter" className="h-8 pl-9" />
						</div>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Has Origin
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							All
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							From Shelf
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							From Bin
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							To Shelf
						</Button>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead>From Bin</TableHead>
								<TableHead>Qty</TableHead>
								<TableHead>To Bin</TableHead>
								<TableHead>Current</TableHead>
								<TableHead className="text-right">
									Range
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody />
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function LogsTab({
	warehouseId,
	organizationId,
}: {
	warehouseId: string;
	organizationId: string;
}) {
	const { data: timeline = [], isPending } = useQuery({
		...orpc.inventory.timeline.queryOptions({
			input: { organizationId, warehouseId, limit: 20 },
		}),
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Inventory Logs
				</h2>
				<Button variant="outline" size="icon" aria-label="Export logs">
					<UploadIcon className="size-4" />
				</Button>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Change Type
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							All Employees
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Date
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Any reason
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Has note
						</Button>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Time</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Description</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending ? (
								<TableRow>
									<TableCell
										colSpan={3}
										className="text-center py-6 text-muted-foreground"
									>
										Loading logs...
									</TableCell>
								</TableRow>
							) : timeline.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={3}
										className="text-center py-6 text-muted-foreground"
									>
										No inventory logs found.
									</TableCell>
								</TableRow>
							) : (
								timeline.map((log: any) => (
									<TableRow key={log.id}>
										<TableCell>
											{new Date(
												log.createdAt,
											).toLocaleString()}
										</TableCell>
										<TableCell>{log.type}</TableCell>
										<TableCell>
											<span className="font-medium underline underline-offset-2">
												{log.sku.name || log.sku.code}
											</span>{" "}
											-{" "}
											{log.quantity > 0
												? "added to"
												: "removed from"}{" "}
											<span className="font-medium">
												{log.location.code}
											</span>
											{log.notes && ` (${log.notes})`}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function BundlesTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1">
					<h2 className="text-3xl font-semibold tracking-tight">
						Kits
					</h2>
					<InfoIcon className="size-4 text-muted-foreground" />
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Export kits"
					>
						<UploadIcon className="size-4" />
					</Button>
					<Button size="sm">Create Kit</Button>
				</div>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-4xl">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Search" className="h-8 pl-9" />
						</div>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Output</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody />
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function CycleCountTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-1">
				<h2 className="text-3xl font-semibold tracking-tight">
					Cycle Counts
				</h2>
				<InfoIcon className="size-4 text-muted-foreground" />
			</div>
			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b py-3">
					<CardTitle className="text-xs font-semibold uppercase tracking-wide">
						Cycle Counts
					</CardTitle>
					<Button size="sm">Create Cycle Count</Button>
				</CardHeader>
				<CardContent className="px-5 py-6 text-sm text-muted-foreground">
					No cycle counts
				</CardContent>
			</Card>
		</div>
	);
}

type LayoutNode = {
	id: string;
	label: string;
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
};

function LayoutTab({
	warehouseId,
	organizationId,
	warehouseName,
}: {
	warehouseId: string;
	organizationId: string;
	warehouseName: string;
}) {
	const [viewMode, setViewMode] = useState<"2d" | "iso" | "3d">("2d");
	const [layoutName, setLayoutName] = useState("Main Layout");
	const [notes, setNotes] = useState("");
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [nodes, setNodes] = useState<LayoutNode[]>([
		{
			id: "RECV-A",
			label: "Receiving A",
			x: 40,
			y: 36,
			width: 160,
			height: 100,
			color: "#60a5fa",
		},
		{
			id: "STOR-B",
			label: "Storage B",
			x: 250,
			y: 70,
			width: 210,
			height: 140,
			color: "#34d399",
		},
	]);
	const [lastSavedLayoutId, setLastSavedLayoutId] = useState<string | null>(
		null,
	);

	const { data: latestLayoutData, isPending: latestLayoutLoading } = useQuery(
		{
			...(orpc.warehouse as any).layout.getLatest.queryOptions({
				input: {
					organizationId,
					warehouseId,
				},
			}),
		},
	);

	useEffect(() => {
		const scene = (latestLayoutData as any)?.layout?.scene;
		if (!scene) {
			return;
		}

		if (scene.viewMode) {
			setViewMode(scene.viewMode);
		}

		if (Array.isArray(scene.nodes) && scene.nodes.length > 0) {
			setNodes(scene.nodes);
			setSelectedNodeId(scene.nodes[0]?.id ?? null);
		}

		if ((latestLayoutData as any)?.layout?.name) {
			setLayoutName((latestLayoutData as any).layout.name);
		}

		setNotes((latestLayoutData as any)?.layout?.notes ?? "");
		setLastSavedLayoutId((latestLayoutData as any)?.layout?.id ?? null);
	}, [latestLayoutData]);

	const saveDraftMutation = useMutation(
		(orpc.warehouse as any).layout.saveDraft.mutationOptions(),
	);
	const publishMutation = useMutation(
		(orpc.warehouse as any).layout.publish.mutationOptions(),
	);

	const selectedNode =
		nodes.find((node) => node.id === selectedNodeId) ?? nodes[0] ?? null;

	const canvasClassName =
		viewMode === "3d"
			? "perspective-[900px]"
			: viewMode === "iso"
				? "[transform:skewY(-6deg)]"
				: "";

	const addNode = () => {
		const nextIndex = nodes.length + 1;
		const newNode: LayoutNode = {
			id: `ZONE-${nextIndex}`,
			label: `Zone ${nextIndex}`,
			x: 60 + nextIndex * 20,
			y: 60 + nextIndex * 14,
			width: 150,
			height: 90,
			color: "#f59e0b",
		};

		setNodes((prev) => [...prev, newNode]);
		setSelectedNodeId(newNode.id);
	};

	const updateSelectedNode = (
		patch: Partial<
			Pick<LayoutNode, "label" | "x" | "y" | "width" | "height" | "color">
		>,
	) => {
		if (!selectedNode) {
			return;
		}

		setNodes((prev) =>
			prev.map((node) =>
				node.id === selectedNode.id
					? {
							...node,
							...patch,
						}
					: node,
			),
		);
	};

	const saveDraft = async () => {
		if (nodes.length === 0) {
			toast.error("Add at least one zone before saving.");
			return;
		}

		const result = await (saveDraftMutation.mutateAsync as any)({
			organizationId,
			warehouseId,
			name: layoutName.trim() || undefined,
			notes: notes.trim() || undefined,
			scene: {
				viewMode,
				nodes,
			},
		});

		setLastSavedLayoutId(result?.layout?.id ?? "temp-id");
		toast.success(`Saved layout draft v${result?.layout?.version ?? "1"}.`);
	};

	const publishLayout = async () => {
		if (!lastSavedLayoutId) {
			toast.error("Save a draft before publishing.");
			return;
		}

		await (publishMutation.mutateAsync as any)({
			organizationId,
			warehouseId,
			layoutVersionId: lastSavedLayoutId,
		});

		toast.success("Layout version published.");
	};

	return (
		<Card className="border">
			<CardHeader className="space-y-3 border-b">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<CardTitle className="text-base">
							Warehouse Layout
						</CardTitle>
						<p className="text-xs text-muted-foreground">
							{warehouseName} • 2D / ISO / 3D scene editor
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant={viewMode === "2d" ? "default" : "outline"}
							size="sm"
							onClick={() => {
								setViewMode("2d");
							}}
						>
							2D
						</Button>
						<Button
							variant={viewMode === "iso" ? "default" : "outline"}
							size="sm"
							onClick={() => {
								setViewMode("iso");
							}}
						>
							ISO
						</Button>
						<Button
							variant={viewMode === "3d" ? "default" : "outline"}
							size="sm"
							onClick={() => {
								setViewMode("3d");
							}}
						>
							3D
						</Button>
					</div>
				</div>

				<div className="grid gap-3 md:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="layout-name">Layout Name</Label>
						<Input
							id="layout-name"
							value={layoutName}
							onChange={(event) => {
								setLayoutName(event.target.value);
							}}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="layout-notes">Notes</Label>
						<Input
							id="layout-notes"
							value={notes}
							onChange={(event) => {
								setNotes(event.target.value);
							}}
							placeholder="Draft notes"
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid gap-4 py-6 lg:grid-cols-[1fr_280px]">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<p className="text-xs font-medium text-muted-foreground">
							Scene Canvas ({viewMode.toUpperCase()})
						</p>
						<Button variant="outline" size="sm" onClick={addNode}>
							<PlusIcon className="mr-1 size-4" />
							Add Zone
						</Button>
					</div>

					<div
						className={`relative h-[440px] overflow-hidden rounded-md border bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-size-[24px_24px] ${canvasClassName}`}
					>
						{viewMode === "3d" ? (
							<Warehouse3DScene nodes={nodes} />
						) : (
							nodes.map((node) => (
								<button
									key={node.id}
									type="button"
									onClick={() => {
										setSelectedNodeId(node.id);
									}}
									className={`absolute rounded-md border text-left shadow-sm transition-all ${
										selectedNodeId === node.id
											? "border-foreground ring-2 ring-foreground/40"
											: "border-border"
									}`}
									style={{
										left: node.x,
										top: node.y,
										width: node.width,
										height: node.height,
										backgroundColor: node.color,
										transform:
											viewMode === "iso"
												? "rotateX(16deg) translateZ(10px)"
												: undefined,
									}}
								>
									<span className="block px-2 py-1 text-xs font-semibold text-slate-900/90">
										{node.label}
									</span>
								</button>
							))
						)}
					</div>

					<div className="flex items-center justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								void publishLayout();
							}}
							disabled={publishMutation.isPending}
						>
							{publishMutation.isPending
								? "Publishing..."
								: "Publish"}
						</Button>
						<Button
							onClick={() => {
								void saveDraft();
							}}
							disabled={saveDraftMutation.isPending}
						>
							{saveDraftMutation.isPending
								? "Saving..."
								: "Save Draft"}
						</Button>
					</div>
				</div>

				<div className="space-y-3 rounded-md border p-3">
					<div>
						<p className="text-sm font-semibold">Node Properties</p>
						<p className="text-xs text-muted-foreground">
							{latestLayoutLoading
								? "Loading latest layout..."
								: `Latest version: ${(latestLayoutData as any)?.layout?.version ?? "-"}`}
						</p>
					</div>

					{selectedNode ? (
						<div className="space-y-2">
							<div className="space-y-1">
								<Label htmlFor="node-label">Label</Label>
								<Input
									id="node-label"
									value={selectedNode.label}
									onChange={(event) => {
										updateSelectedNode({
											label: event.target.value,
										});
									}}
								/>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<Label htmlFor="node-x">X</Label>
									<Input
										id="node-x"
										type="number"
										value={selectedNode.x}
										onChange={(event) => {
											updateSelectedNode({
												x: Number(event.target.value),
											});
										}}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="node-y">Y</Label>
									<Input
										id="node-y"
										type="number"
										value={selectedNode.y}
										onChange={(event) => {
											updateSelectedNode({
												y: Number(event.target.value),
											});
										}}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="node-width">Width</Label>
									<Input
										id="node-width"
										type="number"
										value={selectedNode.width}
										onChange={(event) => {
											updateSelectedNode({
												width: Number(
													event.target.value,
												),
											});
										}}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="node-height">Height</Label>
									<Input
										id="node-height"
										type="number"
										value={selectedNode.height}
										onChange={(event) => {
											updateSelectedNode({
												height: Number(
													event.target.value,
												),
											});
										}}
									/>
								</div>
							</div>
							<div className="space-y-1">
								<Label htmlFor="node-color">Color</Label>
								<Input
									id="node-color"
									value={selectedNode.color}
									onChange={(event) => {
										updateSelectedNode({
											color: event.target.value,
										});
									}}
								/>
							</div>
						</div>
					) : (
						<p className="text-xs text-muted-foreground">
							Select a zone node to edit properties.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function OrdersTab() {
	return (
		<Tabs defaultValue="fulfill" className="space-y-4 flex flex-col">
			<TabsList
				variant="line"
				className="h-auto justify-start gap-2 rounded-none px-0 pb-0"
			>
				<TabsTrigger
					value="fulfill"
					className="px-3 py-2 text-sm font-medium"
				>
					Fulfill
				</TabsTrigger>
				<TabsTrigger
					value="manifests"
					className="px-3 py-2 text-sm font-medium"
				>
					Manifests
				</TabsTrigger>
				<TabsTrigger
					value="purchase-orders"
					className="px-3 py-2 text-sm font-medium"
				>
					Purchase Orders
				</TabsTrigger>
				<TabsTrigger
					value="outbound-orders"
					className="px-3 py-2 text-sm font-medium"
				>
					Outbound Orders
				</TabsTrigger>
			</TabsList>

			<TabsContent value="fulfill" className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-semibold tracking-tight">
						Fulfill
					</h2>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							Packed Shipments
						</Button>
						<Button variant="outline" size="sm">
							View Manifests
						</Button>
					</div>
				</div>
				<Card className="border">
					<CardHeader className="border-b px-4 py-3">
						<CardTitle className="text-xs font-semibold uppercase tracking-wide">
							Batches
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="border-b px-4 py-2 text-xs font-semibold">
							No Filters
						</div>
						<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Batch Status
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Create Date
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Delivery Date
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Any Priority
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Assigned to Anyone
							</Button>
							<Pager />
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Assignee</TableHead>
									<TableHead>Tote</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Deliver At</TableHead>
									<TableHead>Progress</TableHead>
									<TableHead>Fulfilled</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody />
						</Table>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="manifests" className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-semibold tracking-tight">
						Manifests
					</h2>
					<Button size="sm">Create Manifests</Button>
				</div>
				<Card className="border">
					<CardContent className="p-0">
						<div className="flex items-center border-b px-4 py-3">
							<Pager />
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Created At</TableHead>
									<TableHead>Carrier</TableHead>
									<TableHead># Shipments</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody />
						</Table>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="purchase-orders" className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-semibold tracking-tight">
						Purchase Orders
					</h2>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="Import purchase orders"
						>
							<UploadIcon className="size-4" />
						</Button>
						<Button variant="outline" size="sm">
							Discrepancies
						</Button>
						<Button size="sm">Create</Button>
					</div>
				</div>
				<Card className="border">
					<CardContent className="p-0">
						<div className="border-b px-4 py-2 text-xs font-semibold">
							No Filters
						</div>
						<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
							<div className="relative w-full max-w-sm">
								<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search"
									className="h-8 pl-9"
								/>
							</div>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Create Date
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Order Tags
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Order Status
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Payment Status
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Any Vendor
							</Button>
							<Pager />
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Status</TableHead>
									<TableHead>Vendor</TableHead>
									<TableHead>Warehouse</TableHead>
									<TableHead>Tags</TableHead>
									<TableHead>ID</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Financial Status</TableHead>
									<TableHead>Delivery Date</TableHead>
									<TableHead className="text-right">
										Progress
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody />
						</Table>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="outbound-orders" className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-semibold tracking-tight">
						Outbound Orders
					</h2>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="View options"
						>
							<EllipsisIcon className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							aria-label="Import outbound orders"
						>
							<UploadIcon className="size-4" />
						</Button>
						<Button variant="outline" size="sm">
							Fulfill
						</Button>
						<Button size="sm">Create</Button>
					</div>
				</div>
				<Card className="border">
					<CardContent className="p-0">
						<div className="border-b px-4 py-2 text-xs font-semibold">
							No Filters
						</div>
						<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
							<div className="relative w-full max-w-2xl">
								<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search"
									className="h-8 pl-9"
								/>
							</div>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Create Date
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Order Tags
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Order Status
							</Button>
							<Pager />
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Status</TableHead>
									<TableHead>Test</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>ID</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Deliver At</TableHead>
									<TableHead>Tags</TableHead>
									<TableHead>Source</TableHead>
									<TableHead className="text-right">
										Progress
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody />
						</Table>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}

export function LayoutTabContent({
	warehouseId,
	organizationId,
	warehouseName,
}: {
	warehouseId: string;
	organizationId: string;
	warehouseName: string;
}) {
	return (
		<TabsContent value="layout" className="space-y-4">
			<LayoutTab
				warehouseId={warehouseId}
				organizationId={organizationId}
				warehouseName={warehouseName}
			/>
		</TabsContent>
	);
}

export function SettingsTabContent({
	values,
	onChange,
	onSave,
	onDelete,
	onRestore,
	saving,
	deleting,
	restoring,
	readOnly,
}: {
	values: WarehouseSettingsFormValues;
	onChange: (patch: Partial<WarehouseSettingsFormValues>) => void;
	onSave: () => void;
	onDelete: () => void;
	onRestore?: () => void;
	saving: boolean;
	deleting: boolean;
	restoring?: boolean;
	readOnly?: boolean;
}) {
	return (
		<TabsContent value="settings" className="space-y-4">
			<SettingsTab
				values={values}
				onChange={onChange}
				onSave={onSave}
				onDelete={onDelete}
				onRestore={onRestore}
				saving={saving}
				deleting={deleting}
				restoring={restoring}
				readOnly={readOnly}
			/>
		</TabsContent>
	);
}

export function InventoryTabContent(props: {
	warehouseId: string;
	organizationId: string;
}) {
	return (
		<TabsContent value="inventory" className="space-y-4">
			<InventoryTab {...props} />
		</TabsContent>
	);
}

export function CycleCountTabContent() {
	return (
		<TabsContent value="cycle-count" className="space-y-4">
			<CycleCountTab />
		</TabsContent>
	);
}

export function LogsTabContent(props: {
	warehouseId: string;
	organizationId: string;
}) {
	return (
		<TabsContent value="logs" className="space-y-4">
			<LogsTab {...props} />
		</TabsContent>
	);
}

export function ReplenishInventoryTabContent() {
	return (
		<TabsContent value="replenish-inventory" className="space-y-4">
			<ReplenishInventoryTab />
		</TabsContent>
	);
}

export function BinReplenishmentTabContent() {
	return (
		<TabsContent value="bin-replenishment" className="space-y-4">
			<BinReplenishmentTab />
		</TabsContent>
	);
}

export function BundlesTabContent() {
	return (
		<TabsContent value="bundles" className="space-y-4">
			<BundlesTab />
		</TabsContent>
	);
}

export function OrdersTabContent() {
	return (
		<TabsContent value="orders" className="space-y-4">
			<OrdersTab />
		</TabsContent>
	);
}
