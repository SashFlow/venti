"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	buildCustomerMetadata,
	readCustomerMetadata,
} from "../lib/customer-utils";
import { useCustomersContext } from "../lib/customers-context";
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

export default function CustomerDetailPage() {
	const params = useParams();
	const customerId = params.id as string;
	const { organizationId, invalidateCustomers } = useCustomersContext();

	const [activeTab, setActiveTab] = useState<PageTab>("orders");
	const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("weekly");

	const [customerName, setCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [customerNotes, setCustomerNotes] = useState("");
	const [isWholesaler, setIsWholesaler] = useState(false);

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

	const { data } = useQuery({
		...orpc.customers.get.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				id: customerId,
			},
		}),
		enabled: Boolean(organizationId && customerId),
	});

	const updateCustomerMutation = useMutation(
		orpc.customers.update.mutationOptions(),
	);

	useEffect(() => {
		const customer = data?.customer;
		if (!customer) {
			return;
		}

		setCustomerName(customer.name);
		setCustomerEmail(customer.email ?? "");
		setCustomerPhone(customer.phone ?? "");
		setCustomerNotes(customer.notes ?? "");
		setIsWholesaler(customer.isWholesaler);

		const metadata = readCustomerMetadata(customer.metadata);
		setDeliveryNotes(metadata.deliveryNotes);
		setScheduleMode((metadata.scheduleMode as ScheduleMode) || "weekly");
		setMonthlyDay(metadata.monthlyDay || "1");
		setQuarterlyMonth(metadata.quarterlyMonth || "q1-first-month");
		setYearlyDate(metadata.yearlyDate || "2026-01-15");

		if (Object.keys(metadata.openByDay).length > 0) {
			setOpenByDay((previous) => ({
				...previous,
				...(metadata.openByDay as Record<Weekday, boolean>),
			}));
		}

		if (Object.keys(metadata.windowByDay).length > 0) {
			setWindowByDay((previous) => ({
				...previous,
				...(metadata.windowByDay as Record<
					Weekday,
					{ start: string; end: string }
				>),
			}));
		}
	}, [data?.customer]);

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

	const saveCustomer = async () => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		if (!customerName.trim()) {
			toast.error("Customer name is required.");
			return;
		}

		await toast.promise(
			updateCustomerMutation.mutateAsync({
				organizationId,
				id: customerId,
				name: customerName.trim(),
				email: customerEmail.trim() || undefined,
				phone: customerPhone.trim() || undefined,
				notes: customerNotes.trim() || undefined,
				isWholesaler,
				metadata: buildCustomerMetadata({
					deliveryNotes,
					scheduleMode,
					monthlyDay,
					quarterlyMonth,
					yearlyDate,
					openByDay,
					windowByDay,
				}),
			}),
			{
				loading: "Saving customer...",
				success: "Customer saved.",
				error: "Failed to save customer.",
			},
		);

		await invalidateCustomers();
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
					onSave={() => {
						void saveCustomer();
					}}
					saving={updateCustomerMutation.isPending}
				/>

				<OrdersTabContent
					customerName={customerName || "This customer"}
				/>

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
					onSave={() => {
						void saveCustomer();
					}}
					saving={updateCustomerMutation.isPending}
				/>
			</Tabs>
		</div>
	);
}
