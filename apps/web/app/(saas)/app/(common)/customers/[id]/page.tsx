"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Ellipsis, Search } from "lucide-react";
import { useMemo, useState } from "react";

type PageTab = "settings" | "orders" | "delivery";
type ScheduleMode = "weekly" | "monthly" | "quarterly" | "yearly";
type Weekday =
	| "Monday"
	| "Tuesday"
	| "Wednesday"
	| "Thursday"
	| "Friday"
	| "Saturday"
	| "Sunday";

const WEEK_DAYS: Weekday[] = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

const EMPTY_TABLE_HEADERS = [
	"Status",
	"Test",
	"ID",
	"Created At",
	"Total",
	"Deliver At",
	"Tags",
	"Source",
	"Progress",
];

export default function CustomerDetailPage() {
	const [activeTab, setActiveTab] = useState<PageTab>("orders");
	const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("weekly");

	const [customerName, setCustomerName] = useState("REE");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerPhone, setCustomerPhone] = useState("+1 123-456-7890");
	const [customerNotes, setCustomerNotes] = useState("");
	const [isWholesaler, setIsWholesaler] = useState(true);

	const [deliveryNotes, setDeliveryNotes] = useState("");
	const [monthlyDay, setMonthlyDay] = useState("1");
	const [quarterlyMonth, setQuarterlyMonth] = useState("q1-first-month");
	const [yearlyDate, setYearlyDate] = useState("2026-01-15");

	const [openByDay, setOpenByDay] = useState<Record<Weekday, boolean>>({
		Monday: true,
		Tuesday: true,
		Wednesday: true,
		Thursday: true,
		Friday: false,
		Saturday: false,
		Sunday: false,
	});

	const [windowByDay, setWindowByDay] = useState<
		Record<Weekday, { start: string; end: string }>
	>({
		Monday: { start: "09:00", end: "17:00" },
		Tuesday: { start: "09:00", end: "17:00" },
		Wednesday: { start: "09:00", end: "17:00" },
		Thursday: { start: "09:00", end: "17:00" },
		Friday: { start: "09:00", end: "17:00" },
		Saturday: { start: "09:00", end: "17:00" },
		Sunday: { start: "09:00", end: "17:00" },
	});

	const activeDaysCount = useMemo(
		() => WEEK_DAYS.filter((day) => openByDay[day]).length,
		[openByDay],
	);

	const updateDayWindow = (
		day: Weekday,
		field: "start" | "end",
		value: string,
	) => {
		setWindowByDay((previous) => ({
			...previous,
			[day]: {
				...previous[day],
				[field]: value,
			},
		}));
	};

	const renderOrdersSection = (title: string) => {
		return (
			<Card className="rounded-xl border">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
						<div className="relative flex-1">
							<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value=""
								onChange={() => undefined}
								placeholder="Search"
								className="pl-9"
							/>
						</div>
						<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
							<Button type="button" variant="outline" size="sm">
								Create Date
							</Button>
							<Button type="button" variant="outline" size="sm">
								Order Tags
							</Button>
							<Select defaultValue="any-warehouse">
								<SelectTrigger className="w-[170px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="any-warehouse">
										Any Warehouse
									</SelectItem>
									<SelectItem value="north">North</SelectItem>
									<SelectItem value="south">South</SelectItem>
								</SelectContent>
							</Select>
							<div className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-7 px-2"
								>
									&lt;
								</Button>
								<span className="min-w-6 text-center text-sm">
									1
								</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-7 px-2"
								>
									&gt;
								</Button>
							</div>
							<Button type="button" variant="outline" size="icon">
								<Ellipsis className="size-4" />
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-9 gap-2 border-t pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{EMPTY_TABLE_HEADERS.map((header) => (
							<div key={header} className="truncate">
								{header}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="container mx-auto max-w-7xl py-8">
			<div className="mb-8">
				<h1 className="font-semibold text-2xl tracking-tight">
					Customer
				</h1>
				<p className="mt-2 text-muted-foreground">
					Manage customer Orders, Delivery and Settings
				</p>
			</div>
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as PageTab)}
				className="flex flex-col"
			>
				<div className="flex items-center justify-start gap-3">
					<TabsList variant="line" className="justify-start">
						<TabsTrigger value="orders" className="px-3">
							Orders
						</TabsTrigger>
						<TabsTrigger value="delivery" className="px-3">
							Delivery
						</TabsTrigger>
						<TabsTrigger value="settings" className="px-3">
							Settings
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="settings" className="space-y-4">
					<Card className="rounded-xl border">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-lg">Settings</CardTitle>
							<Button size="sm">Save</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>
									Name{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Input
									value={customerName}
									onChange={(event) =>
										setCustomerName(event.target.value)
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
											setCustomerEmail(event.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Phone</Label>
									<Input
										value={customerPhone}
										onChange={(event) =>
											setCustomerPhone(event.target.value)
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Notes</Label>
								<textarea
									value={customerNotes}
									onChange={(event) =>
										setCustomerNotes(event.target.value)
									}
									rows={4}
									className="w-full rounded-md border bg-background px-3 py-2 text-sm"
								/>
							</div>
							<div className="flex items-center gap-3">
								<Switch
									checked={isWholesaler}
									onCheckedChange={(checked) =>
										setIsWholesaler(Boolean(checked))
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

				<TabsContent value="orders" className="space-y-4">
					{/* <div className="flex justify-end">
						<Button
							variant="outline"
							size="icon"
							aria-label="Refresh"
						>
							↻
						</Button>
					</div> */}
					{renderOrdersSection("Pending Orders")}
					{renderOrdersSection("Completed Orders")}
				</TabsContent>

				<TabsContent value="delivery" className="space-y-4">
					<Card className="rounded-xl border">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-lg">Delivery</CardTitle>
							<Button size="sm">Save</Button>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="space-y-2">
								<Label>Delivery Notes</Label>
								<textarea
									value={deliveryNotes}
									onChange={(event) =>
										setDeliveryNotes(event.target.value)
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
										setScheduleMode(value as ScheduleMode)
									}
								>
									<SelectTrigger className="w-full md:max-w-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="weekly">
											Weekly
										</SelectItem>
										<SelectItem value="monthly">
											Monthly
										</SelectItem>
										<SelectItem value="quarterly">
											Quarterly
										</SelectItem>
										<SelectItem value="yearly">
											Yearly
										</SelectItem>
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
										{WEEK_DAYS.map((day) => (
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
														onCheckedChange={(
															checked,
														) =>
															setOpenByDay(
																(previous) => ({
																	...previous,
																	[day]: Boolean(
																		checked,
																	),
																}),
															)
														}
													/>
												</div>
												<Input
													type="time"
													value={
														windowByDay[day].start
													}
													disabled={!openByDay[day]}
													onChange={(event) =>
														updateDayWindow(
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
														updateDayWindow(
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
													setMonthlyDay(value ?? "1")
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
											Delivery is scheduled every month on
											day {monthlyDay}.
										</p>
									</div>
								) : null}

								{scheduleMode === "quarterly" ? (
									<div className="grid gap-4 p-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label>
												Quarter Delivery Month
											</Label>
											<Select
												value={quarterlyMonth}
												onValueChange={(value) =>
													setQuarterlyMonth(
														value ??
															"q1-first-month",
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
											Deliveries recur every quarter based
											on your selected month position.
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
													setYearlyDate(
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
									{WEEK_DAYS.map((day) => (
										<div
											key={day}
											className="rounded border p-2"
										>
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
			</Tabs>
		</div>
	);
}
