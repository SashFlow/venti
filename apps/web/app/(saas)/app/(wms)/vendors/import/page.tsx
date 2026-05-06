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
import {
	ArrowLeftIcon,
	CheckIcon,
	DownloadIcon,
	UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

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

// TODO: wire up real import API
async function importVendors(_file: File): Promise<{ imported: number }> {
	await new Promise((resolve) => setTimeout(resolve, 1200));
	return { imported: 0 };
}

// TODO: wire up template download
function downloadTemplate() {
	const csvHeader = IMPORT_FIELDS.map((field) => field.column).join(",");
	const blob = new Blob([`${csvHeader}\n`], { type: "text/csv" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = "vendors_import_template.csv";
	anchor.click();
	URL.revokeObjectURL(url);
}

export default function ImportVendorsPage() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isImporting, setIsImporting] = useState(false);

	function handleFile(file: File) {
		const allowed = [
			"text/csv",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"application/json",
		];
		if (
			!allowed.includes(file.type) &&
			!file.name.match(/\.(csv|xlsx|xls|json)$/i)
		) {
			toast.error("Only CSV, Excel, or JSON files are supported.");
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
		setIsImporting(true);
		try {
			await toast.promise(importVendors(selectedFile), {
				loading: `Importing ${selectedFile.name}...`,
				success: (result) => `Imported ${result.imported} vendors.`,
				error: "Import failed. Check the file format and try again.",
			});
			setSelectedFile(null);
		} finally {
			setIsImporting(false);
		}
	}

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
						<UploadIcon className="size-8 mx-auto text-primary" />
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
							accept=".csv,.xlsx,.xls,.json"
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
