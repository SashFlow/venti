export type ExportJobStatus = "queued" | "running" | "completed" | "failed";

export type ExportJob = {
	id: string;
	reportType: string;
	scope: string;
	status: ExportJobStatus;
	createdAt: string;
	completedAt: string | null;
	format: "csv" | "xlsx";
	requestedBy: string;
	rowCount: string;
};

export type CreateExportJobInput = {
	reportType: string;
	scope: string;
	format: "csv" | "xlsx";
	requestedBy: string;
};

export const EXPORT_STORAGE_KEY = "venti.mock.export.jobs";

export const DEFAULT_EXPORT_JOBS: ExportJob[] = [
	{
		id: "EXP-1042",
		reportType: "Inventory Snapshot",
		scope: "All warehouses",
		status: "completed",
		createdAt: "12 May 2026, 09:10",
		completedAt: "12 May 2026, 09:12",
		format: "csv",
		requestedBy: "Warehouse Ops",
		rowCount: "42,180 rows",
	},
	{
		id: "EXP-1040",
		reportType: "Customer Master",
		scope: "Wholesale accounts",
		status: "running",
		createdAt: "12 May 2026, 08:44",
		completedAt: null,
		format: "xlsx",
		requestedBy: "Sales Operations",
		rowCount: "Preparing",
	},
	{
		id: "EXP-1036",
		reportType: "Vendor Directory",
		scope: "All vendors",
		status: "queued",
		createdAt: "12 May 2026, 08:03",
		completedAt: null,
		format: "csv",
		requestedBy: "Procurement",
		rowCount: "Queued",
	},
];

export function createMockExportJob(
	input: CreateExportJobInput,
	date = new Date(),
): ExportJob {
	const createdAt = date.toLocaleString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	return {
		id: `EXP-${date.getTime().toString().slice(-4)}`,
		reportType: input.reportType,
		scope: input.scope,
		status: "queued",
		createdAt,
		completedAt: null,
		format: input.format,
		requestedBy: input.requestedBy,
		rowCount: "Queued",
	};
}
