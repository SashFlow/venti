import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { Switch } from "@repo/ui/switch";
import { TabsContent } from "@repo/ui/tabs";
import { Link2Icon } from "lucide-react";

export type ScheduleMode = "weekly" | "monthly" | "quarterly" | "yearly";

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
};

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
}: SettingsTabContentProps) {
	return (
		<TabsContent value="settings" className="space-y-4">
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

			<Card className="rounded-xl border">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Locations
					</CardTitle>
					<Button size="sm">Create Location</Button>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 border-t pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						<div>Name</div>
						<div>Location</div>
					</div>
				</CardContent>
			</Card>

			<Card className="rounded-xl border">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Edit Metadata
					</CardTitle>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							Add Attribute
						</Button>
						<Button size="sm">Save</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 border-t pt-4">
					<p className="text-muted-foreground text-sm">
						Store custom key/value pairs on this customer.
					</p>
					<div className="flex justify-end">
						<Button variant="outline" size="sm">
							Show Supported Types
						</Button>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

export function OrdersTabContent({ customerName }: { customerName: string }) {
	return (
		<TabsContent value="orders" className="space-y-4">
			<Card className="rounded-xl border">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-lg">Orders</CardTitle>
					<Button variant="outline" size="sm">
						<Link2Icon className="mr-2 size-4" />
						Connect Order Feed
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Order history for {customerName.toLowerCase()} is not
						exposed through the current customer detail API yet.
						This tab is staged for live order history, filters, and
						timeline metrics.
					</p>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-xl border p-4">
							<p className="text-sm font-medium">
								Pending orders
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Awaiting customer-order relation queries.
							</p>
						</div>
						<div className="rounded-xl border p-4">
							<p className="text-sm font-medium">
								Completed orders
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Shipment and delivery summaries will appear
								here.
							</p>
						</div>
						<div className="rounded-xl border p-4">
							<p className="text-sm font-medium">Filters</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Date, warehouse, and tag filters are reserved
								for the live feed.
							</p>
						</div>
					</div>
					<div className="rounded-md border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
						No customer orders are available in this detail view
						yet.
					</div>
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
