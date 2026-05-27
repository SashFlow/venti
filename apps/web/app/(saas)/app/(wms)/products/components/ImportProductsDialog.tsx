"use client";

import { Button } from "@repo/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/dialog";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type ImportProductsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ImportProductsDialog({
	open,
	onOpenChange,
}: ImportProductsDialogProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleDownloadTemplate = () => {
		const headers = [
			"productCode",
			"productName",
			"description",
			"isPerishable",
			"isBatchTracked",
			"isSerialTracked",
			"skuCode",
			"baseUomId",
		];
		const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "products_import_template.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setSelectedFile(e.target.files[0]);
		}
	};

	const handleImport = async () => {
		if (!selectedFile) {
			toast.error("Please select a file to import.");
			return;
		}

		// TODO: Implement actual CSV parsing and API call to batch create products
		toast.info("Import functionality is coming soon.");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Import Products</DialogTitle>
					<DialogDescription>
						Upload a CSV file to import products in bulk.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 pt-4">
					<div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/20">
						<UploadIcon className="w-8 h-8 mb-4 text-muted-foreground" />
						<input
							type="file"
							accept=".csv"
							className="hidden"
							ref={fileInputRef}
							onChange={handleFileChange}
						/>
						<Button
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
						>
							Select CSV File
						</Button>
						{selectedFile && (
							<p className="mt-4 text-sm text-muted-foreground">
								Selected: {selectedFile.name}
							</p>
						)}
					</div>

					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							className="text-muted-foreground"
							onClick={handleDownloadTemplate}
						>
							<DownloadIcon className="w-4 h-4 mr-2" />
							Download Template
						</Button>

						<div className="space-x-2">
							<Button
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleImport}
								disabled={!selectedFile}
							>
								Import
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
