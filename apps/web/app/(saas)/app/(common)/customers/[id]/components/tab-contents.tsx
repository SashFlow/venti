import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { Skeleton } from "@repo/ui/skeleton";
import { Switch } from "@repo/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { TabsContent } from "@repo/ui/tabs";
import { MapPinIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";

export type ScheduleMode = "weekly" | "monthly" | "quarterly" | "yearly";

// ── Shared types ──────────────────────────────────────────────────────────────

export type CustomerLocation = {
	id: string;
	customerId: string;
	organizationId: string;
	name: string;
	isDefault: boolean;
	notes?: string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
	address: {
		id: string;
		addressLine1: string;
		addressLine2?: string | null;
		city: string;
		state: string;
		zip: string;
		country: string;
	};
};

export type CustomerOrder = {
	id: string;
	orderNumber: string;
	status: string;
	customerName?: string | null;
	customerRef?: string | null;
	createdAt: Date | string;
	requiredByDate?: Date | string | null;
	warehouse: { name: string };
	_count: { lines: number };
};

type CreateLocationInput = {
	name: string;
	isDefault: boolean;
	notes?: string;
	address: {
		addressLine1: string;
		addressLine2?: string;
		city: string;
		state: string;
		zip: string;
		country: string;
	};
};

// ── Settings tab ──────────────────────────────────────────────────────────────

type SettingsTabContentProps = {
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	customerNotes: string;
	isWholesaler: boolean;
	onCustomerNameChange: (value: string) => void;
	onCustomerEmailChange: (value: string) => void;
	onCustomerPhoneChange: (value: string) => void;
	onCustomerNotesChange: (value: string) => void;
	onWholesalerChange: (value: boolean) => void;
	onSave?: () => void;
	saving?: boolean;
	// Locations
	locations: CustomerLocation[];
	locationsLoading: boolean;
	onCreateLocation: (input: CreateLocationInput) => Promise<void>;
	onDeleteLocation: (id: string) => Promise<void>;
	// Custom attributes
	customAttributes: Record<string, string>;
	onCustomAttributeChange: (key: string, value: string) => void;
	onCustomAttributeAdd: () => void;
	onCustomAttributeRemove: (key: string) => void;
	onCustomAttributesSave: () => void;
	customAttributesSaving?: boolean;
};

const EMPTY_LOCATION_FORM: CreateLocationInput = {
	name: "",
	isDefault: false,
	notes: "",
	address: {
		addressLine1: "",
		addressLine2: "",
		city: "",
		state: "",
		zip: "",
		country: "",
	},
};

function formatAddress(addr: CustomerLocation["address"]): string {
	return [addr.addressLine1, addr.city, addr.state, addr.country]
		.filter(Boolean)
		.join(", ");
}

export function SettingsTabContent({
	customerName,
	customerEmail,
	customerPhone,
	customerNotes,
	isWholesaler,
	onCustomerNameChange,
	onCustomerEmailChange,
	onCustomerPhoneChange,
	onCustomerNotesChange,
	onWholesalerChange,
	onSave,
	saving,
	locations,
	locationsLoading,
	onCreateLocation,
	onDeleteLocation,
	customAttributes,
	onCustomAttributeChange,
	onCustomAttributeAdd,
	onCustomAttributeRemove,
	onCustomAttributesSave,
	customAttributesSaving,
}: SettingsTabContentProps) {
	const [locationDialogOpen, setLocationDialogOpen] = useState(false);
	const [locationForm, setLocationForm] =
		useState<CreateLocationInput>(EMPTY_LOCATION_FORM);
	const [locationSaving, setLocationSaving] = useState(false);

	const handleCreateLocation = async () => {
		if (!locationForm.name.trim()) return;
		setLocationSaving(true);
		try {
			await onCreateLocation({
				...locationForm,
				name: locationForm.name.trim(),
				notes: locationForm.notes?.trim() || undefined,
				address: {
					...locationForm.address,
					addressLine2:
						locationForm.address.addressLine2?.trim() ||
						undefined,
				},
			});
			setLocationForm(EMPTY_LOCATION_FORM);
			setLocationDialogOpen(false);
		} finally {
			setLocationSaving(false);
		}
	};

	return (
		<TabsContent value="settings" className="space-y-4">
			{/* ── Core settings ── */}
			<Card className="rounded-xl border">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-lg">Settings</CardTitle>
					<Button size="sm" onClick={onSave} disabled={saving}>
						Save
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>
							Name <span className="text-destructive">*</span>
						</Label>
						<Input
							value={customerName}
							onChange={(event) =>
								onCustomerNameChange(event.target.value)
							}
						/>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Email</Label>
							<Input
								type="email"
								value={customerEmail}
								onChange={(event) =>
									onCustomerEmailChange(event.target.value)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Phone</Label>
							<Input
								value={customerPhone}
								onChange={(event) =>
									onCustomerPhoneChange(event.target.value)
								}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label>Notes</Label>
						<textarea
							value={customerNotes}
							onChange={(event) =>
								onCustomerNotesChange(event.target.value)
							}
							rows={4}
							className="w-full rounded-md border bg-background px-3 py-2 text-sm"
						/>
					</div>
					<div className="flex items-center gap-3">
						<Switch
							checked={isWholesaler}
							onCheckedChange={(checked) =>
								onWholesalerChange(Boolean(checked))
							}
						/>
						<p className="text-sm font-medium">
							Customer is a wholesaler
						</p>
					</div>
				</CardContent>
			</Card>

			{/* ── Locations ── */}
			<Card className="rounded-xl border">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Locations
					</CardTitle>
					<Dialog
						open={locationDialogOpen}
						onOpenChange={setLocationDialogOpen}
					>
						<DialogTrigger asChild>
							<Button size="sm">Create Location</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>New Location</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-2">
								<div className="space-y-2">
									<Label>
										Name{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										value={locationForm.name}
										onChange={(e) =>
											setLocationForm((f) => ({
												...f,
												name: e.target.value,
											}))
										}
										placeholder="e.g. Main Warehouse"
									/>
								</div>
								<div className="space-y-2">
									<Label>Address Line 1</Label>
									<Input
										value={
											locationForm.address.addressLine1
										}
										onChange={(e) =>
											setLocationForm((f) => ({
												...f,
												address: {
													...f.address,
													addressLine1:
														e.target.value,
												},
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Address Line 2</Label>
									<Input
										value={
											locationForm.address
												.addressLine2 ?? ""
										}
										onChange={(e) =>
											setLocationForm((f) => ({
												...f,
												address: {
													...f.address,
													addressLine2:
														e.target.value,
												},
											}))
										}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>City</Label>
										<Input
											value={locationForm.address.city}
											onChange={(e) =>
												setLocationForm((f) => ({
													...f,
													address: {
														...f.address,
														city: e.target.value,
													},
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>State</Label>
										<Input
											value={locationForm.address.state}
											onChange={(e) =>
												setLocationForm((f) => ({
													...f,
													address: {
														...f.address,
														state: e.target.value,
													},
												}))
											}
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>ZIP</Label>
										<Input
											value={locationForm.address.zip}
											onChange={(e) =>
												setLocationForm((f) => ({
													...f,
													address: {
														...f.address,
														zip: e.target.value,
													},
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Country</Label>
										<Input
											value={
												locationForm.address.country
											}
											onChange={(e) =>
												setLocationForm((f) => ({
													...f,
													address: {
														...f.address,
														country: e.target.value,
													},
												}))
											}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label>Notes</Label>
									<Input
										value={locationForm.notes ?? ""}
										onChange={(e) =>
											setLocationForm((f) => ({
												...f,
												notes: e.target.value,
											}))
										}
									/>
								</div>
								<div className="flex items-center gap-3">
									<Switch
										checked={locationForm.isDefault}
										onCheckedChange={(checked) =>
											setLocationForm((f) => ({
												...f,
												isDefault: Boolean(checked),
											}))
										}
									/>
									<Label>Set as default location</Label>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() =>
										setLocationDialogOpen(false)
									}
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										void handleCreateLocation();
									}}
									disabled={
										locationSaving ||
										!locationForm.name.trim()
									}
								>
									{locationSaving ? "Creating…" : "Create"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent>
					{locationsLoading ? (
						<div className="space-y-2 pt-3">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : locations.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
							<MapPinIcon className="size-6 opacity-40" />
							<p>No locations yet. Create one to get started.</p>
						</div>
					) : (
						<div className="divide-y border-t">
							{locations.map((loc) => (
								<div
									key={loc.id}
									className="flex items-center justify-between py-3"
								>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">
												{loc.name}
											</span>
											{loc.isDefault && (
												<Badge
													variant="secondary"
													className="text-xs"
												>
													Default
												</Badge>
											)}
										</div>
										<p className="truncate text-xs text-muted-foreground">
											{formatAddress(loc.address)}
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="shrink-0 text-destructive hover:text-destructive"
										onClick={() => {
											void onDeleteLocation(loc.id);
										}}
									>
										<Trash2Icon className="size-4" />
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* ── Edit Metadata ── */}
			<Card className="rounded-xl border">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Edit Metadata
					</CardTitle>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={onCustomAttributeAdd}
						>
							Add Attribute
						</Button>
						<Button
							size="sm"
							onClick={onCustomAttributesSave}
							disabled={customAttributesSaving}
						>
							Save
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-3 border-t pt-4">
					{Object.keys(customAttributes).length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No custom attributes yet. Click &quot;Add
							Attribute&quot; to add key/value pairs.
						</p>
					) : (
						Object.entries(customAttributes).map(
							([key, value], index) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: stable for this pattern
									key={index}
									className="flex items-center gap-2"
								>
									<Input
										placeholder="Key"
										value={key}
										className="w-1/3"
										onChange={(e) => {
											const newKey = e.target.value;
											const entries = Object.entries(
												customAttributes,
											);
											entries[index] = [newKey, value];
											const next = Object.fromEntries(
												entries,
											) as Record<string, string>;
											onCustomAttributeChange(
												newKey,
												value,
											);
											// Replace the whole map via a workaround:
											// remove old key, add new key
											if (newKey !== key) {
												onCustomAttributeRemove(key);
												onCustomAttributeChange(
													newKey,
													value,
												);
											}
										}}
									/>
									<Input
										placeholder="Value"
										value={value}
										className="flex-1"
										onChange={(e) =>
											onCustomAttributeChange(
												key,
												e.target.value,
											)
										}
									/>
									<Button
										variant="ghost"
										size="icon"
										onClick={() =>
											onCustomAttributeRemove(key)
										}
									>
										<XIcon className="size-4" />
									</Button>
								</div>
							),
						)
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// ── Orders tab ────────────────────────────────────────────────────────────────

type OrdersTabContentProps = {
	orders: CustomerOrder[];
	isLoading: boolean;
};

function formatDate(date: Date | string | null | undefined): string {
	if (!date) return "—";
	return new Date(date).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function OrdersTabContent({ orders, isLoading }: OrdersTabContentProps) {
	return (
		<TabsContent value="orders" className="space-y-4">
			<Card className="rounded-xl border">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">Orders</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 4 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					) : orders.length === 0 ? (
						<div className="rounded-md border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
							No orders linked to this customer yet.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order #</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Warehouse</TableHead>
									<TableHead>Required By</TableHead>
									<TableHead className="text-right">
										Lines
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => (
									<TableRow key={order.id}>
										<TableCell className="font-medium">
											{order.orderNumber}
										</TableCell>
										<TableCell>
											<Badge variant="secondary">
												{order.status}
											</Badge>
										</TableCell>
										<TableCell>
											{order.warehouse.name}
										</TableCell>
										<TableCell>
											{formatDate(order.requiredByDate)}
										</TableCell>
										<TableCell className="text-right">
											{order._count.lines}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

type DeliveryTabContentProps = {
	scheduleMode: ScheduleMode;
	deliveryNotes: string;
	monthlyDay: string;
	quarterlyMonth: string;
	yearlyDate: string;
	weekDays: string[];
	activeDaysCount: number;
	openByDay: Record<string, boolean>;
	windowByDay: Record<string, { start: string; end: string }>;
	onDeliveryNotesChange: (value: string) => void;
	onScheduleModeChange: (value: ScheduleMode) => void;
	onMonthlyDayChange: (value: string) => void;
	onQuarterlyMonthChange: (value: string) => void;
	onYearlyDateChange: (value: string) => void;
	onDayOpenChange: (day: string, checked: boolean) => void;
	onDayWindowChange: (
		day: string,
		field: "start" | "end",
		value: string,
	) => void;
	onSave?: () => void;
	saving?: boolean;
};

export function DeliveryTabContent({
	scheduleMode,
	deliveryNotes,
	monthlyDay,
	quarterlyMonth,
	yearlyDate,
	weekDays,
	activeDaysCount,
	openByDay,
	windowByDay,
	onDeliveryNotesChange,
	onScheduleModeChange,
	onMonthlyDayChange,
	onQuarterlyMonthChange,
	onYearlyDateChange,
	onDayOpenChange,
	onDayWindowChange,
	onSave,
	saving,
}: DeliveryTabContentProps) {
	return (
		<TabsContent value="delivery" className="space-y-4">
			<Card className="rounded-xl border">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-lg">Delivery</CardTitle>
					<Button size="sm" onClick={onSave} disabled={saving}>
						Save
					</Button>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="space-y-2">
						<Label>Delivery Notes</Label>
						<textarea
							value={deliveryNotes}
							onChange={(event) =>
								onDeliveryNotesChange(event.target.value)
							}
							rows={3}
							className="w-full rounded-md border bg-background px-3 py-2 text-sm"
						/>
					</div>

					<div className="grid gap-3 md:grid-cols-[220px_1fr] md:items-center">
						<Label className="font-semibold">
							Delivery Schedule
						</Label>
						<Select
							value={scheduleMode}
							onValueChange={(value) =>
								onScheduleModeChange(value as ScheduleMode)
							}
						>
							<SelectTrigger className="w-full md:max-w-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="weekly">Weekly</SelectItem>
								<SelectItem value="monthly">Monthly</SelectItem>
								<SelectItem value="quarterly">
									Quarterly
								</SelectItem>
								<SelectItem value="yearly">Yearly</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="rounded-lg border">
						<div className="flex items-center justify-between border-b px-4 py-3">
							<h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
								Delivery Availability
							</h3>
							<p className="text-xs text-muted-foreground">
								Active Days: {activeDaysCount}
							</p>
						</div>

						{scheduleMode === "weekly" ? (
							<div className="space-y-0">
								<div className="grid grid-cols-[1.3fr_0.8fr_1fr_1fr] border-b bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									<div>Day</div>
									<div>Open</div>
									<div>Start</div>
									<div>End</div>
								</div>
								{weekDays.map((day) => (
									<div
										key={day}
										className="grid grid-cols-[1.3fr_0.8fr_1fr_1fr] items-center gap-2 border-b px-4 py-2 last:border-b-0"
									>
										<p className="text-sm font-medium">
											{day}
										</p>
										<div>
											<Switch
												checked={openByDay[day]}
												onCheckedChange={(checked) =>
													onDayOpenChange(
														day,
														Boolean(checked),
													)
												}
											/>
										</div>
										<Input
											type="time"
											value={windowByDay[day].start}
											disabled={!openByDay[day]}
											onChange={(event) =>
												onDayWindowChange(
													day,
													"start",
													event.target.value,
												)
											}
										/>
										<Input
											type="time"
											value={windowByDay[day].end}
											disabled={!openByDay[day]}
											onChange={(event) =>
												onDayWindowChange(
													day,
													"end",
													event.target.value,
												)
											}
										/>
									</div>
								))}
							</div>
						) : null}

						{scheduleMode === "monthly" ? (
							<div className="grid gap-4 p-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label>Delivery Day of Month</Label>
									<Select
										value={monthlyDay}
										onValueChange={(value) =>
											onMonthlyDayChange(value ?? "1")
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Array.from(
												{ length: 28 },
												(_, i) => i + 1,
											).map((d) => (
												<SelectItem
													key={d}
													value={String(d)}
												>
													Day {d}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Time Window</Label>
									<div className="grid grid-cols-2 gap-2">
										<Input
											type="time"
											defaultValue="09:00"
										/>
										<Input
											type="time"
											defaultValue="17:00"
										/>
									</div>
								</div>
								<p className="text-muted-foreground text-sm md:col-span-2">
									Delivery is scheduled every month on day{" "}
									{monthlyDay}.
								</p>
							</div>
						) : null}

						{scheduleMode === "quarterly" ? (
							<div className="grid gap-4 p-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label>Quarter Delivery Month</Label>
									<Select
										value={quarterlyMonth}
										onValueChange={(value) =>
											onQuarterlyMonthChange(
												value ?? "q1-first-month",
											)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="q1-first-month">
												First Month of Quarter
											</SelectItem>
											<SelectItem value="q2-second-month">
												Second Month of Quarter
											</SelectItem>
											<SelectItem value="q3-third-month">
												Third Month of Quarter
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Quarterly Time Window</Label>
									<div className="grid grid-cols-2 gap-2">
										<Input
											type="time"
											defaultValue="09:00"
										/>
										<Input
											type="time"
											defaultValue="17:00"
										/>
									</div>
								</div>
								<p className="text-muted-foreground text-sm md:col-span-2">
									Deliveries recur every quarter based on your
									selected month position.
								</p>
							</div>
						) : null}

						{scheduleMode === "yearly" ? (
							<div className="grid gap-4 p-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label>Yearly Delivery Date</Label>
									<Input
										type="date"
										value={yearlyDate}
										onChange={(event) =>
											onYearlyDateChange(
												event.target.value,
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Yearly Time Window</Label>
									<div className="grid grid-cols-2 gap-2">
										<Input
											type="time"
											defaultValue="09:00"
										/>
										<Input
											type="time"
											defaultValue="17:00"
										/>
									</div>
								</div>
								<p className="text-muted-foreground text-sm md:col-span-2">
									Annual delivery occurs on{" "}
									{yearlyDate || "the selected date"}.
								</p>
							</div>
						) : null}
					</div>

					<div className="rounded-lg border p-4">
						<div className="mb-3 flex items-center justify-between">
							<h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
								Schedule Preview
							</h4>
							<p className="text-xs text-muted-foreground">
								00:00 - 23:59
							</p>
						</div>
						<div className="grid grid-cols-7 gap-1 text-center text-xs">
							{weekDays.map((day) => (
								<div key={day} className="rounded border p-2">
									<p className="mb-2 font-semibold">
										{day.slice(0, 3)}
									</p>
									<div
										className={
											openByDay[day]
												? "h-12 rounded bg-primary/20"
												: "h-12 rounded bg-muted"
										}
									/>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
