const CURRENCY_LOCALE: Record<string, string> = {
	inr: "en-IN",
	usd: "en-US",
	eur: "de-DE",
	gbp: "en-GB",
};

function formatInrCompact(amount: number): string {
	if (amount >= 10_000_000) {
		return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
	}
	if (amount >= 100_000) {
		return `₹${(amount / 100_000).toFixed(1)} L`;
	}
	if (amount >= 1_000) {
		return `₹${(amount / 1_000).toFixed(0)}K`;
	}
	return `₹${amount.toFixed(0)}`;
}

export function formatOrgCurrency(
	amount: number,
	currency = "inr",
	compact = false,
): string {
	const normalized = currency.toLowerCase();

	if (compact && normalized === "inr") {
		return formatInrCompact(amount);
	}

	const locale = CURRENCY_LOCALE[normalized] ?? "en-US";
	const currencyCode = normalized.toUpperCase();

	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currencyCode,
		maximumFractionDigits: compact ? 0 : 2,
	}).format(amount);
}
