import type { Prisma } from "../prisma/generated/client";

export function asMetadataRecord(metadata: unknown): Record<string, unknown> {
	if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
		return {};
	}

	return metadata as Record<string, unknown>;
}

export function deriveEntityCode(name: string, prefix?: string): string {
	const explicitPrefix = prefix?.trim();
	if (explicitPrefix) {
		return explicitPrefix.toUpperCase().slice(0, 50);
	}

	const fromName = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
	if (fromName) {
		return fromName.slice(0, 8);
	}

	return `ENT${Date.now().toString().slice(-6)}`;
}

export function getMetadataCode(metadata: unknown, name: string): string {
	const record = asMetadataRecord(metadata);
	const code = record.code;

	if (typeof code === "string" && code.trim()) {
		return code.trim().toUpperCase();
	}

	return deriveEntityCode(name);
}

export function mergeMetadataWithCode(
	metadata: Prisma.InputJsonValue | undefined,
	code: string,
): Prisma.InputJsonValue {
	const record = asMetadataRecord(metadata);

	return {
		...record,
		code: code.trim().toUpperCase(),
	};
}
