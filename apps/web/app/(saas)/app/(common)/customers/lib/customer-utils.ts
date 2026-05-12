export type CustomerMetadata = {
	address1?: string;
	address2?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
	deliveryNotes?: string;
	scheduleMode?: string;
	monthlyDay?: string;
	quarterlyMonth?: string;
	yearlyDate?: string;
	openByDay?: Record<string, boolean>;
	windowByDay?: Record<string, { start: string; end: string }>;
	customAttributes?: Record<string, string>;
};

function asRecord(value: unknown) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return {} as Record<string, unknown>;
	}

	return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, key: string) {
	const value = record[key];
	return typeof value === "string" ? value : "";
}

export function readCustomerMetadata(metadata: unknown): Required<
	Omit<CustomerMetadata, "openByDay" | "windowByDay">
> & {
	openByDay: Record<string, boolean>;
	windowByDay: Record<string, { start: string; end: string }>;
} {
	const record = asRecord(metadata);
	const openByDayRaw = asRecord(record.openByDay);
	const windowByDayRaw = asRecord(record.windowByDay);

	const openByDay = Object.fromEntries(
		Object.entries(openByDayRaw).map(([key, value]) => [
			key,
			value === true,
		]),
	);

	const windowByDay = Object.fromEntries(
		Object.entries(windowByDayRaw).map(([key, value]) => {
			const dayRecord = asRecord(value);
			return [
				key,
				{
					start: readString(dayRecord, "start") || "09:00",
					end: readString(dayRecord, "end") || "17:00",
				},
			];
		}),
	);

	return {
		address1: readString(record, "address1"),
		address2: readString(record, "address2"),
		city: readString(record, "city"),
		state: readString(record, "state"),
		zip: readString(record, "zip"),
		country: readString(record, "country"),
		deliveryNotes: readString(record, "deliveryNotes"),
		scheduleMode: readString(record, "scheduleMode"),
		monthlyDay: readString(record, "monthlyDay"),
		quarterlyMonth: readString(record, "quarterlyMonth"),
		yearlyDate: readString(record, "yearlyDate"),
		openByDay,
		windowByDay,
	};
}

export function buildCustomerMetadata(
	input: CustomerMetadata,
): CustomerMetadata {
	return {
		address1: input.address1?.trim() || undefined,
		address2: input.address2?.trim() || undefined,
		city: input.city?.trim() || undefined,
		state: input.state?.trim() || undefined,
		zip: input.zip?.trim() || undefined,
		country: input.country?.trim() || undefined,
		deliveryNotes: input.deliveryNotes?.trim() || undefined,
		scheduleMode: input.scheduleMode?.trim() || undefined,
		monthlyDay: input.monthlyDay?.trim() || undefined,
		quarterlyMonth: input.quarterlyMonth?.trim() || undefined,
		yearlyDate: input.yearlyDate?.trim() || undefined,
		openByDay: input.openByDay,
		windowByDay: input.windowByDay,
		customAttributes: input.customAttributes,
	};
}
