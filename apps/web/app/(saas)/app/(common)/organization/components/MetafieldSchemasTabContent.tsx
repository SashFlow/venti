import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/label";
import { TabsContent } from "@repo/ui/tabs";
import { Edit, Plus, Trash2 } from "lucide-react";
import { METAFIELD_TYPE_OPTIONS } from "./constants";
import { InputRow, SectionCard, SelectRow } from "./shared";
import type { MetafieldSchema } from "./types";

export function MetafieldSchemasTabContent({
	metafieldSchemas,
	editingSchema,
	cancelEditingSchema,
	startEditingSchema,
	deleteMetafieldSchema,
	newSchemaName,
	setNewSchemaName,
	newSchemaNamespace,
	setNewSchemaNamespace,
	newSchemaType,
	setNewSchemaType,
	newSchemaRequired,
	setNewSchemaRequired,
	addMetafieldSchema,
	saveEditedSchema,
}: {
	metafieldSchemas: MetafieldSchema[];
	editingSchema: MetafieldSchema | null;
	cancelEditingSchema: () => void;
	startEditingSchema: (schema: MetafieldSchema) => void;
	deleteMetafieldSchema: (id: string) => void;
	newSchemaName: string;
	setNewSchemaName: (value: string) => void;
	newSchemaNamespace: string;
	setNewSchemaNamespace: (value: string) => void;
	newSchemaType: string;
	setNewSchemaType: (value: string) => void;
	newSchemaRequired: boolean;
	setNewSchemaRequired: (value: boolean) => void;
	addMetafieldSchema: () => void;
	saveEditedSchema: () => void;
}) {
	return (
		<TabsContent value="metafield_schemas" className="space-y-4">
			<SectionCard
				id="metafield_schemas"
				title="Metafield Schemas"
				actions={
					<Button
						size="sm"
						onClick={() => {
							if (editingSchema) {
								cancelEditingSchema();
							}
						}}
						disabled={!editingSchema}
					>
						Cancel
					</Button>
				}
			>
				{metafieldSchemas.length === 0 ? (
					<div className="rounded-lg border border-dashed p-6 text-center">
						<p className="mb-2 font-semibold text-sm">
							YOU DON'T HAVE ANY METAFIELD SCHEMAS SETUP YET
						</p>
						<p className="text-muted-foreground text-xs">
							Metafield schemas let you define custom fields with
							validation rules, required field enforcement, and
							type constraints. Use them to ensure consistent data
							entry across your team when adding metadata to
							records like inbound orders. This will enforce that
							when creating a purchase order, for example, the
							metafields will be prepopulated.
						</p>
					</div>
				) : (
					<div className="space-y-3">
						<div className="overflow-hidden rounded-lg border">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b bg-muted/50">
										<th className="px-4 py-3 text-left font-semibold">
											Name
										</th>
										<th className="px-4 py-3 text-left font-semibold">
											Namespace
										</th>
										<th className="px-4 py-3 text-left font-semibold">
											Type
										</th>
										<th className="px-4 py-3 text-left font-semibold">
											Required
										</th>
										<th className="px-4 py-3 text-right font-semibold">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{metafieldSchemas.map((schema) => (
										<tr
											key={schema.id}
											className="border-b hover:bg-muted/30"
										>
											<td className="px-4 py-3">
												{schema.name}
											</td>
											<td className="px-4 py-3 text-muted-foreground">
												{schema.namespace}
											</td>
											<td className="px-4 py-3 text-muted-foreground text-xs">
												{schema.type.replace(/_/g, " ")}
											</td>
											<td className="px-4 py-3">
												<span
													className={`inline-block rounded px-2 py-1 text-xs font-medium ${
														schema.required
															? "bg-blue-100 text-blue-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{schema.required
														? "Yes"
														: "No"}
												</span>
											</td>
											<td className="px-4 py-3 text-right">
												<div className="flex justify-end gap-2">
													<Button
														size="sm"
														variant="ghost"
														onClick={() =>
															startEditingSchema(
																schema,
															)
														}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() =>
															deleteMetafieldSchema(
																schema.id,
															)
														}
													>
														<Trash2 className="h-4 w-4 text-red-600" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				<div className="mt-6 border-t pt-6">
					<h4 className="mb-4 font-semibold text-sm">
						{editingSchema ? "Edit Schema" : "Add New Schema"}
					</h4>
					<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<InputRow
							label="Field Name"
							value={newSchemaName}
							onChange={setNewSchemaName}
							placeholder="e.g., Color"
						/>
						<InputRow
							label="Namespace"
							value={newSchemaNamespace}
							onChange={setNewSchemaNamespace}
							placeholder="e.g., custom"
						/>
					</div>
					<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<SelectRow
							label="Field Type"
							value={newSchemaType}
							onValueChange={setNewSchemaType}
							options={METAFIELD_TYPE_OPTIONS}
						/>
						<div className="flex items-end">
							<div className="flex w-full items-center gap-3 rounded-lg border p-3">
								<input
									type="checkbox"
									checked={newSchemaRequired}
									onChange={(event) =>
										setNewSchemaRequired(
											event.target.checked,
										)
									}
									className="h-4 w-4"
								/>
								<Label className="cursor-pointer text-sm font-medium">
									Required Field
								</Label>
							</div>
						</div>
					</div>
					<div className="flex gap-2">
						{editingSchema ? (
							<>
								<Button onClick={saveEditedSchema} size="sm">
									Save Changes
								</Button>
								<Button
									onClick={cancelEditingSchema}
									variant="outline"
									size="sm"
								>
									Cancel
								</Button>
							</>
						) : (
							<Button onClick={addMetafieldSchema} size="sm">
								<Plus className="mr-2 h-4 w-4" />
								Add Schema
							</Button>
						)}
					</div>
				</div>
			</SectionCard>
		</TabsContent>
	);
}
