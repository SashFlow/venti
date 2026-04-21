import type { PrismaTx } from "./stock-ledger";

/**
 * Generate a sequential document number in the format: {PREFIX}-{YYYYMM}-{XXXX}
 * e.g. PO-202412-0042, GRN-202412-0001
 *
 * countFn must be executed WITHIN the calling transaction to avoid race conditions.
 * For best results: use with serializable isolation or call inside a transaction
 * that has already locked the parent record.
 */
export async function generateDocNumber(
	_tx: PrismaTx,
	params: {
		organizationId: string;
		prefix: string;
		/** Must return the current count of existing documents for this org */
		countFn: () => Promise<number>;
	},
): Promise<string> {
	const count = await params.countFn();
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const seq = String(count + 1).padStart(4, "0");
	return `${params.prefix}-${year}${month}-${seq}`;
}
