/**
 * Privacy utility for AI data processing.
 * Helps in detecting and redacting PII before sending data to external AI providers.
 */

const PII_PATTERNS = {
	email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
	phone: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
	// creditCard: /\b(?:\d[ -]*?){13,16}\b/g, // Too aggressive, might match random numbers
	ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
};

/**
 * Redacts common PII from a string.
 */
export function redactPII(text: string): string {
	let redactedText = text;

	for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
		redactedText = redactedText.replace(
			pattern,
			`[REDACTED_${type.toUpperCase()}]`,
		);
	}

	return redactedText;
}

/**
 * Checks if a string contains PII.
 */
export function hasPII(text: string): boolean {
	return Object.values(PII_PATTERNS).some((pattern) => pattern.test(text));
}
