"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeftIcon,
	CheckIcon,
	DownloadIcon,
	Loader2Icon,
	UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useVendorsContext } from "../lib/vendors-context";

type ImportField = {
	column: string;
	description: string;
	required: boolean;
};

const IMPORT_FIELDS: ImportField[] = [
	{ column: "Name", description: "-", required: true },
	{ column: "Account Number", description: "-", required: false },
	{ column: "Apt/Suite", description: "-", required: false },
	{
		column: "Brands",
		description:
			"Comma-separated Shopify vendor/brand strings that map to this supplier",
		required: false,
	},
	{ column: "City", description: "-", required: false },
	{
		column: "Country",
		description: 'Free-text, e.g. "US", "USA", or "United States"',
		required: false,
	},
	{ column: "Email", description: "-", required: false },
	{ column: "Note", description: "-", required: false },
	{ column: "Phone", description: "-", required: false },
	{
		column: "Prefix",
		description:
			'3-character vendor prefix (e.g. "ACM"). Auto-generated on first PO if blank.',
		required: false,
	},
	{ column: "Rep Name", description: "-", required: false },
	{
		column: "State",
		description: 'Free-text, e.g. "CA" or "California"',
		required: false,
	},
	{ column: "Street Address", description: "-", required: false },
	{ column: "Zip", description: "-", required: false },
];

type SupplierImportRow = {
	name: string;
	prefix?: string;
	email?: string;
	phone?: string;
	accountNumber?: string;
	representativeName?: string;
	brands?: string;
	notes?: string;
	address1?: string;
	address2?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
};

function splitCsvLine(line: string) {
	const values: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];
		const next = line[index + 1];

		if (char === '"' && inQuotes && next === '"') {
			current += '"';
			index += 1;
			continue;
		}

		if (char === '"') {
			inQuotes = !inQuotes;
			continue;
		}

		if (char === "," && !inQuotes) {
			values.push(current.trim());
			current = "";
			continue;
		}

		current += char;
	}

	values.push(current.trim());
	return values;
}

function buildImportRow(record: Record<string, string>): SupplierImportRow {
	return {
		name: record["Name"] || record.name || "",
		prefix: record["Prefix"] || record.prefix || undefined,
		email: record["Email"] || record.email || undefined,
		phone: record["Phone"] || record.phone || undefined,
		accountNumber:
			record["Account Number"] || record.accountNumber || undefined,
		representativeName:
			record["Rep Name"] || record.representativeName || undefined,
		brands: record["Brands"] || record.brands || undefined,
		notes: record["Note"] || record.notes || undefined,
		address1: record["Street Address"] || record.address1 || undefined,
		address2: record["Apt/Suite"] || record.address2 || undefined,
		city: record["City"] || record.city || undefined,
		state: record["State"] || record.state || undefined,
		zip: record["Zip"] || record.zip || undefined,
		country: record["Country"] || record.country || undefined,
	};
}

async function parseImportRows(file: File) {
	const fileName = file.name.toLowerCase();
	const content = await file.text();

	if (fileName.endsWith(".json")) {
		const parsed = JSON.parse(content);
		if (!Array.isArray(parsed)) {
			throw new Error("JSON import file must be an array of rows.");
		}

		return parsed
			.map((row) => {
				if (!row || typeof row !== "object" || Array.isArray(row)) {
					return null;
				}

				const mapped = buildImportRow(
					Object.fromEntries(
						Object.entries(row as Record<string, unknown>).map(
							([key, value]) => [
								key,
								typeof value === "string" ? value : "",
							],
						),
					),
				);

				return mapped.name.trim() ? mapped : null;
			})
			.filter((row): row is SupplierImportRow => Boolean(row));
	}

	if (!fileName.endsWith(".csv")) {
		throw new Error(
			"Only CSV or JSON import files are currently supported.",
		);
	}

	const lines = content
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length === 0) {
		return [];
	}

	const headers = splitCsvLine(lines[0]);
	const rows = lines.slice(1).map((line) => {
		const values = splitCsvLine(line);
		const record: Record<string, string> = {};

		headers.forEach((header, index) => {
			record[header] = values[index] ?? "";
		});

		return buildImportRow(record);
	});

	return rows.filter((row) => row.name.trim());
}

export default function ImportVendorsPage() {
	const queryClient = useQueryClient();
	const { organizationId, invalidateVendors } = useVendorsContext();
	const importSuppliersMutation = useMutation(
		orpc.masterData.suppliers.import.mutationOptions(),
	);
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isImporting, setIsImporting] = useState(false);

	function handleFile(file: File) {
		const allowed = ["text/csv", "application/json"];
		if (
			!allowed.includes(file.type) &&
			!file.name.match(/\.(csv|json)$/i)
		) {
			toast.error("Only CSV or JSON files are supported.");
			return;
		}
		setSelectedFile(file);
	}

	function handleDrop(event: React.DragEvent) {
		event.preventDefault();
		setIsDragging(false);
		const file = event.dataTransfer.files[0];
		if (file) {
			handleFile(file);
		}
	}

	async function handleImport() {
		if (!selectedFile) {
			return;
		}

		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		setIsImporting(true);
		try {
			const rows = await parseImportRows(selectedFile);
			if (rows.length === 0) {
				toast.error("No valid rows found in the selected file.");
				return;
			}

			await toast.promise(
				importSuppliersMutation.mutateAsync({
					organizationId: organizationId ?? "",
					rows,
				}),
				{
					loading: `Importing ${selectedFile.name}...`,
					success: (result) => {
						const errorSuffix =
							result.errors.length > 0
								? ` (${result.errors.length} rows failed)`
								: "";
						return `Imported ${result.created} new and updated ${result.updated} vendors${errorSuffix}.`;
					},
					error: "Import failed. Check the file format and try again.",
				},
			);
			await invalidateVendors();
			setSelectedFile(null);
		} finally {
			setIsImporting(false);
		}
	}

	const downloadTemplate = async () => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		const template = await queryClient.fetchQuery(
			orpc.masterData.suppliers.importTemplate.queryOptions({
				input: { organizationId },
			}),
		);

		const blob = new Blob([template.csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = template.fileName;
		anchor.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="container py-8 max-w-7xl mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/vendors">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<h1 className="text-2xl font-semibold tracking-tight">
					Import Vendors
				</h1>
			</div>

			<label
				htmlFor="vendor-upload-input"
				className={`block cursor-pointer rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
					isDragging
						? "border-primary bg-primary/5"
						: "border-muted-foreground/30 bg-muted/30 hover:border-muted-foreground/50"
				}`}
				onDragOver={(event) => {
					event.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleDrop}
			>
				{selectedFile ? (
					<div className="space-y-3">
						{isImporting ? (
							<Loader2Icon className="size-8 mx-auto text-primary animate-spin" />
						) : (
							<UploadIcon className="size-8 mx-auto text-primary" />
						)}
						<p className="font-medium">{selectedFile.name}</p>
						<p className="text-sm text-muted-foreground">
							{(selectedFile.size / 1024).toFixed(1)} KB
						</p>
						<div className="flex items-center justify-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedFile(null)}
							>
								Remove
							</Button>
							<Button
								size="sm"
								onClick={handleImport}
								disabled={isImporting}
							>
								Import
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-3xl font-semibold tracking-tight">
							Drop a CSV, Excel, or JSON file here
						</p>
						<div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
							<span className="h-px w-12 bg-border" />
							OR
							<span className="h-px w-12 bg-border" />
						</div>
						<span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-1.5 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground">
							Browse Files
						</span>
						<input
							ref={inputRef}
							id="vendor-upload-input"
							type="file"
							accept=".csv,.json"
							className="sr-only"
							onChange={(event) => {
								const file = event.target.files?.[0];
								if (file) {
									handleFile(file);
								}
							}}
						/>
					</div>
				)}
			</label>

			<Card className="rounded-2xl border">
				<CardHeader className="flex flex-row items-center justify-between py-3 px-4">
					<CardTitle className="text-xs font-semibold uppercase tracking-widest">
						Import Fields
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						className="gap-1.5 text-xs"
						onClick={downloadTemplate}
					>
						<DownloadIcon className="size-3.5" />
						Template
					</Button>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-52">Column</TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="w-24 text-right">
									Required
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{IMPORT_FIELDS.map((field) => (
								<TableRow key={field.column}>
									<TableCell className="font-medium">
										{field.column}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{field.description}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end">
											{field.required ? (
												<span className="flex size-5 items-center justify-center rounded-full bg-primary">
													<CheckIcon className="size-3 text-primary-foreground" />
													<span className="sr-only">
														{field.column} is
														required
													</span>
												</span>
											) : (
												<span className="flex size-5 items-center justify-center rounded-full border border-input">
													<span className="sr-only">
														{field.column} is
														optional
													</span>
												</span>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
