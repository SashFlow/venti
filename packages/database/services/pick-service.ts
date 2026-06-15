import { db } from "../prisma";

function normalizeScan(code: string): string {
	return code.trim().toUpperCase();
}

function skuMatchesScan(
	sku: { code: string; barcode: string | null },
	scanCode: string,
): boolean {
	const scan = normalizeScan(scanCode);
	if (!scan) {
		return false;
	}
	if (normalizeScan(sku.code) === scan) {
		return true;
	}
	if (sku.barcode && normalizeScan(sku.barcode) === scan) {
		return true;
	}
	return false;
}

export async function getPickProgress(waveId: string) {
	const lines = await db.pickWaveLine.findMany({
		where: { pickWaveId: waveId },
		select: { qtyToPick: true, qtyPicked: true },
	});

	const totalLines = lines.length;
	let completedLines = 0;

	for (const line of lines) {
		const toPick = Number(line.qtyToPick);
		const picked = Number(line.qtyPicked);
		if (picked >= toPick && toPick > 0) {
			completedLines++;
		}
	}

	const percent =
		totalLines > 0 ? Math.round((completedLines / totalLines) * 100) : 0;

	return { totalLines, completedLines, percent };
}

export async function confirmPickLine(params: {
	organizationId: string;
	waveId: string;
	lineId: string;
	userId: string;
	qtyPicked?: number;
	scanCode?: string;
}) {
	const line = await db.pickWaveLine.findFirst({
		where: {
			id: params.lineId,
			pickWaveId: params.waveId,
			pickWave: {
				status: "RELEASED",
				warehouse: { organizationId: params.organizationId },
			},
		},
		include: {
			location: { select: { id: true, code: true } },
			pickWave: { select: { warehouseId: true } },
			salesOrderItem: {
				include: {
					sku: { select: { id: true, code: true, barcode: true } },
				},
			},
		},
	});

	if (!line) {
		throw new Error("Pick line not found or wave is not released.");
	}

	const sku = line.salesOrderItem.sku;

	if (params.scanCode && !skuMatchesScan(sku, params.scanCode)) {
		const err = new Error("Scanned barcode does not match this SKU.");
		(err as Error & { code: string }).code = "SCAN_MISMATCH";
		throw err;
	}

	const qtyToPick = Number(line.qtyToPick);
	const alreadyPicked = Number(line.qtyPicked);
	const remaining = Math.max(0, qtyToPick - alreadyPicked);

	if (remaining <= 0) {
		throw new Error("Line is already fully picked.");
	}

	const increment = params.qtyPicked ?? remaining;
	const newQtyPicked = Math.min(qtyToPick, alreadyPicked + increment);

	const updated = await db.pickWaveLine.update({
		where: { id: line.id },
		data: { qtyPicked: newQtyPicked },
		include: {
			location: { select: { id: true, code: true } },
			salesOrderItem: {
				include: {
					sku: { select: { id: true, code: true, barcode: true } },
				},
			},
		},
	});

	if (params.scanCode) {
		await db.scanEvent.create({
			data: {
				warehouseId: line.pickWave.warehouseId,
				userId: params.userId,
				locationId: line.locationId,
				barcode: params.scanCode.trim(),
				eventType: "PICK",
				metadata: {
					waveId: params.waveId,
					lineId: params.lineId,
					skuCode: sku.code,
				},
			},
		});
	}

	const progress = await getPickProgress(params.waveId);

	if (progress.completedLines === progress.totalLines && progress.totalLines > 0) {
		await db.pickWave.update({
			where: { id: params.waveId },
			data: { status: "COMPLETED", completedAt: new Date() },
		});
	}

	return {
		line: {
			id: updated.id,
			qtyToPick: updated.qtyToPick,
			qtyPicked: updated.qtyPicked,
			pickSequence: updated.pickSequence,
			pickerLabel: updated.pickerLabel,
			location: updated.location,
			sku: {
				code: updated.salesOrderItem.sku.code,
				barcode: updated.salesOrderItem.sku.barcode,
			},
		},
		progress,
		waveCompleted:
			progress.completedLines === progress.totalLines &&
			progress.totalLines > 0,
	};
}
