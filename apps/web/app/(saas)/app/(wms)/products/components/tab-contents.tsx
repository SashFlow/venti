import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { TabsContent } from "@repo/ui/tabs";
import { Textarea } from "@repo/ui/textarea";

export type ImportField = {
	column: string;
	description: string;
	required: boolean;
};

export function SkuTabContent() {
	return (
		<TabsContent value="sku" className="space-y-4">
			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">Product Variants</CardTitle>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							...
						</Button>
						<Button size="sm">Create Product</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 p-4">
					<div className="grid gap-3 md:grid-cols-5">
						<Input placeholder="Search" />
						<Input placeholder="Status" />
						<Input placeholder="Product Type" />
						<Input placeholder="Product Tags" />
						<Input placeholder="Price" />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Product</TableHead>
								<TableHead>Product Type</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Unit Costs</TableHead>
								<TableHead>ABC</TableHead>
								<TableHead className="text-right">
									Qty
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell className="font-medium underline underline-offset-2">
									Chappal
								</TableCell>
								<TableCell>-</TableCell>
								<TableCell>KKIE</TableCell>
								<TableCell>$1.00</TableCell>
								<TableCell>$0.05</TableCell>
								<TableCell>-</TableCell>
								<TableCell className="text-right">
									101
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

export function InventoryTabContent() {
	return (
		<TabsContent value="inventory" className="space-y-4">
			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">Create Product</CardTitle>
					<Button size="sm">Create Product</Button>
				</CardHeader>
				<CardContent className="space-y-6 p-4">
					<div className="space-y-2">
						<p className="text-sm font-medium">Name*</p>
						<Input />
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<p className="text-sm font-medium">Tags</p>
							<Input placeholder="Product Tag" />
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium">Type</p>
							<Input />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wider">
						Variants
					</CardTitle>
					<Button variant="outline" size="sm">
						Add Option
					</Button>
				</CardHeader>
				<CardContent className="p-4">
					<div className="grid gap-3 md:grid-cols-[1fr_0.8fr_1fr_1fr_1fr_auto]">
						<Input placeholder="SKU" />
						<Input placeholder="$ 9.99" />
						<Input placeholder="Length" />
						<Input placeholder="Width" />
						<Input placeholder="Height" />
						<Button variant="outline" size="icon">
							+
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wider">
						Product Image
					</CardTitle>
					<Button variant="outline" size="sm">
						Browse
					</Button>
				</CardHeader>
				<CardContent className="p-4">
					<div className="flex h-36 w-36 items-center justify-center rounded-md border border-dashed text-sm font-medium text-muted-foreground">
						+ Add Image
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

export function LotsTabContent() {
	return (
		<TabsContent value="lots" className="space-y-4">
			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">Lots</CardTitle>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							Lot Classifications
						</Button>
						<Button variant="outline" size="sm">
							Notification Settings
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 p-4">
					<div className="grid gap-3 md:grid-cols-3">
						<Input placeholder="Filter: All" />
						<Input placeholder="In Stock" />
						<Input placeholder="Page 1" />
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Expiration</TableHead>
								<TableHead>Items</TableHead>
								<TableHead className="text-right">
									Total Qty
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									className="text-muted-foreground"
									colSpan={4}
								>
									No lots found.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">
						Lot Classifications
					</CardTitle>
					<Button size="sm">Create</Button>
				</CardHeader>
				<CardContent className="space-y-4 p-4">
					<div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
						Lot classifications define expiration day ranges (e.g.
						0-30, 31-180) that can be targeted during batch picking.
					</div>

					<div className="mx-auto max-w-2xl rounded-lg border p-4">
						<div className="mb-4 flex items-center justify-between">
							<p className="text-sm font-semibold uppercase">
								Create Lot Classification
							</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm">
									Cancel
								</Button>
								<Button size="sm">Create</Button>
							</div>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2 md:col-span-2">
								<p className="text-sm font-medium">Name*</p>
								<Input placeholder="e.g. Class A" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">Min Days*</p>
								<Input type="number" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">Max Days*</p>
								<Input type="number" />
							</div>
							<div className="space-y-2 md:col-span-2">
								<p className="text-sm font-medium">Color</p>
								<div className="grid grid-cols-[44px_1fr] gap-2">
									<Input
										type="color"
										defaultValue="#000000"
									/>
									<Input defaultValue="#000000" />
								</div>
							</div>
							<div className="space-y-2 md:col-span-2">
								<p className="text-sm font-medium">
									Order Tags
								</p>
								<Input placeholder="Add tag" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

export function BundlesTabContent() {
	return (
		<TabsContent value="bundles" className="space-y-4">
			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">Create Kit</CardTitle>
					<Button size="sm" disabled>
						Create
					</Button>
				</CardHeader>
				<CardContent className="space-y-4 p-4">
					<div className="space-y-2">
						<p className="text-sm font-medium">Name</p>
						<Input />
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium">Description</p>
						<Textarea rows={3} />
					</div>
				</CardContent>
			</Card>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wider">
						Kit Input
					</CardTitle>
					<Button size="sm" variant="outline">
						Add Item
					</Button>
				</CardHeader>
				<CardContent className="space-y-3 p-4">
					<div className="rounded-md border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-destructive">
						Must have at least one input
					</div>
					<div className="grid gap-3 md:grid-cols-[1fr_120px]">
						<Input defaultValue="Chappal" />
						<Input type="number" defaultValue="1" />
					</div>
				</CardContent>
			</Card>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wider">
						Kit Output
					</CardTitle>
					<Button size="sm" variant="outline">
						Add Item
					</Button>
				</CardHeader>
				<CardContent className="space-y-3 p-4">
					<div className="rounded-md border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-destructive">
						Must have at least one output
					</div>
					<div className="grid gap-3 md:grid-cols-[1fr_120px]">
						<Input defaultValue="Chappal" />
						<Input type="number" defaultValue="1" />
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

type ImportsTabContentProps = {
	importFields: ImportField[];
};

export function ImportsTabContent({ importFields }: ImportsTabContentProps) {
	return (
		<TabsContent value="imports" className="space-y-4">
			<div className="rounded-xl border-2 border-dashed px-6 py-12 text-center">
				<p className="text-3xl font-semibold tracking-tight">
					Drop a CSV, Excel, or JSON file here
				</p>
				<p className="my-4 text-sm font-semibold text-muted-foreground">
					OR
				</p>
				<Button variant="outline">Browse Files</Button>
			</div>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wider">
						Import Fields
					</CardTitle>
					<Button variant="outline" size="sm">
						Template
					</Button>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-40">Column</TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="w-24 text-right">
									Required
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{importFields.map((field) => (
								<TableRow key={field.column}>
									<TableCell className="font-medium">
										{field.column}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{field.description}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end">
											<span
												className={`inline-flex h-5 w-5 rounded-full border ${
													field.required
														? "border-primary bg-primary"
														: "border-input"
												}`}
											/>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
