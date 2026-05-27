import { Button } from "@repo/ui/button";
import { DataTable } from "@repo/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import React, { useMemo, useState } from "react";

export interface UnitOfMeasure {
	id: string;
	code: string;
	name: string;
}

interface UOMTableProps {
	uoms: UnitOfMeasure[];
	onUpdate: (id: string, uom: Omit<UnitOfMeasure, "id">) => void;
	onDelete: (id: string) => void;
}

export const UOMTable: React.FC<UOMTableProps> = ({
	uoms,
	onUpdate,
	onDelete,
}) => {
	const [editingUOM, setEditingUOM] = useState<UnitOfMeasure | null>(null);

	const columns = useMemo<ColumnDef<UnitOfMeasure>[]>(
		() => [
			{
				accessorKey: "code",
				header: "Code",
				cell: ({ getValue }) => <span>{getValue() as string}</span>,
			},
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ getValue }) => <span>{getValue() as string}</span>,
			},
			{
				id: "actions",
				cell: ({ row }) => {
					const uom = row.original;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => setEditingUOM(uom)}
								>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-destructive focus:bg-destructive/10"
									onClick={() => onDelete(uom.id)}
								>
									<Trash className="mr-2 h-4 w-4 text-destructive" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[onDelete],
	);

	return (
		<>
			<DataTable columns={columns} data={uoms} />
			<Dialog
				open={!!editingUOM}
				onOpenChange={(open) => !open && setEditingUOM(null)}
			>
				<DialogContent>
					{editingUOM && (
						<AddUOMForm
							initialData={editingUOM}
							onAdd={(data) => {
								onUpdate(editingUOM.id, data);
								setEditingUOM(null);
							}}
							onClose={() => setEditingUOM(null)}
							isEdit
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

interface AddUOMFormProps {
	onAdd: (uom: Omit<UnitOfMeasure, "id">) => void;
	onClose?: () => void;
	initialData?: Omit<UnitOfMeasure, "id">;
	isEdit?: boolean;
}

export const AddUOMForm: React.FC<AddUOMFormProps> = ({
	onAdd,
	onClose,
	initialData,
	isEdit,
}) => {
	const [code, setCode] = useState(initialData?.code || "");
	const [name, setName] = useState(initialData?.name || "");

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (code && name) {
					onAdd({ code, name });
				}
			}}
		>
			<DialogHeader>
				<DialogTitle>
					{isEdit ? "Edit Unit of Measure" : "Add Unit of Measure"}
				</DialogTitle>
			</DialogHeader>
			<div className="grid gap-4 py-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="uom-code">Code</Label>
					<Input
						id="uom-code"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						placeholder="e.g. EA"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="uom-name">Name</Label>
					<Input
						id="uom-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g. Each"
					/>
				</div>
			</div>
			<DialogFooter>
				<Button type="button" variant="outline" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" variant="default">
					{isEdit ? "Save Changes" : "Add"}
				</Button>
			</DialogFooter>
		</form>
	);
};
