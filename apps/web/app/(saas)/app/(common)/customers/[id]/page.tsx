"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useMemo, useState } from "react";
import {
	DeliveryTabContent,
	OrdersTabContent,
	type ScheduleMode,
	SettingsTabContent,
} from "./components/tab-contents";

type PageTab = "settings" | "orders" | "delivery";
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

				<SettingsTabContent
					customerName={customerName}
					customerEmail={customerEmail}
					customerPhone={customerPhone}
					customerNotes={customerNotes}
					isWholesaler={isWholesaler}
					onCustomerNameChange={setCustomerName}
					onCustomerEmailChange={setCustomerEmail}
					onCustomerPhoneChange={setCustomerPhone}
					onCustomerNotesChange={setCustomerNotes}
					onWholesalerChange={setIsWholesaler}
				/>

				<OrdersTabContent emptyTableHeaders={EMPTY_TABLE_HEADERS} />

				<DeliveryTabContent
					scheduleMode={scheduleMode}
					deliveryNotes={deliveryNotes}
					monthlyDay={monthlyDay}
					quarterlyMonth={quarterlyMonth}
					yearlyDate={yearlyDate}
					weekDays={WEEK_DAYS}
					activeDaysCount={activeDaysCount}
					openByDay={openByDay}
					windowByDay={windowByDay}
					onDeliveryNotesChange={setDeliveryNotes}
					onScheduleModeChange={setScheduleMode}
					onMonthlyDayChange={setMonthlyDay}
					onQuarterlyMonthChange={setQuarterlyMonth}
					onYearlyDateChange={setYearlyDate}
					onDayOpenChange={(day, checked) =>
						setOpenByDay((previous) => ({
							...previous,
							[day as Weekday]: checked,
						}))
					}
					onDayWindowChange={(day, field, value) =>
						updateDayWindow(day as Weekday, field, value)
					}
				/>
			</Tabs>
		</div>
	);
}
