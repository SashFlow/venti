"use client";

import { useEffect } from "react";

export function PrintPickList({
	waveNumber,
	pickerLabel,
	stops,
}: {
	waveNumber: string;
	pickerLabel: string;
	stops: Array<{
		sequence: number;
		skuCode: string;
		locationCode: string;
		qtyToPick: number;
	}>;
}) {
	useEffect(() => {
		const timer = setTimeout(() => window.print(), 300);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="print-only hidden print:block p-8 text-black bg-white">
			<h1 className="text-xl font-bold mb-2">Pick list — {waveNumber}</h1>
			<p className="text-sm mb-4">{pickerLabel}</p>
			<table className="w-full text-sm border-collapse">
				<thead>
					<tr className="border-b">
						<th className="text-left py-1">#</th>
						<th className="text-left py-1">SKU</th>
						<th className="text-left py-1">Bin</th>
						<th className="text-right py-1">Qty</th>
					</tr>
				</thead>
				<tbody>
					{stops.map((s) => (
						<tr key={s.sequence} className="border-b">
							<td className="py-1">{s.sequence}</td>
							<td className="py-1 font-mono">{s.skuCode}</td>
							<td className="py-1">{s.locationCode}</td>
							<td className="py-1 text-right">{s.qtyToPick}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
