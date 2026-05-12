export type VendorMetadata = {
	accountNumber?: string;
	representativeName?: string;
	communicationPreference?: string;
	notes?: string;
	brands?: string;
	address1?: string;
	address2?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
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

export function deriveSupplierCode(name: string, prefix: string) {
	const normalizedPrefix = prefix.trim().toUpperCase();
	if (normalizedPrefix) {
		return normalizedPrefix.slice(0, 50);
	}

	const fromName = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
	if (fromName) {
		return fromName.slice(0, 8);
	}

	return `SUP${Date.now().toString().slice(-6)}`;
}

export function readVendorMetadata(
	metadata: unknown,
): Required<VendorMetadata> {
	const record = asRecord(metadata);

	return {
		accountNumber: readString(record, "accountNumber"),
		representativeName: readString(record, "representativeName"),
		communicationPreference: readString(record, "communicationPreference"),
		notes: readString(record, "notes"),
		brands: readString(record, "brands"),
		address1: readString(record, "address1"),
		address2: readString(record, "address2"),
		city: readString(record, "city"),
		state: readString(record, "state"),
		zip: readString(record, "zip"),
		country: readString(record, "country"),
	};
}

export function buildVendorMetadata(input: VendorMetadata): VendorMetadata {
	return {
		accountNumber: input.accountNumber?.trim() || undefined,
		representativeName: input.representativeName?.trim() || undefined,
		communicationPreference:
			input.communicationPreference?.trim() || undefined,
		notes: input.notes?.trim() || undefined,
		brands: input.brands?.trim() || undefined,
		address1: input.address1?.trim() || undefined,
		address2: input.address2?.trim() || undefined,
		city: input.city?.trim() || undefined,
		state: input.state?.trim() || undefined,
		zip: input.zip?.trim() || undefined,
		country: input.country?.trim() || undefined,
	};
}
