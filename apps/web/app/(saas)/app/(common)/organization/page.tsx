"use client";

import { authClient } from "@repo/auth/client";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { TooltipProvider } from "@repo/ui/tooltip";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CycleCountsTabContent } from "./components/CycleCountsTabContent";
import { INITIAL_TOGGLES, TAB_ITEMS } from "./components/constants";
import { DataRetentionTabContent } from "./components/DataRetentionTabContent";
import { FulfillmentTabContent } from "./components/FulfillmentTabContent";
import { InventoryTabContent } from "./components/InventoryTabContent";
import { MetafieldSchemasTabContent } from "./components/MetafieldSchemasTabContent";
import { PurchaseOrdersTabContent } from "./components/PurchaseOrdersTabContent";
import { ScanningTabContent } from "./components/ScanningTabContent";
import { TransfersTabContent } from "./components/TransfersTabContent";
import type { MetafieldSchema } from "./components/types";
import { UnitsTabContent } from "./components/UnitsTabContent";
import { WhitelableTabContent } from "./components/WhitelableTabContent";

export default function OrganizationPage() {
	const { activeOrganization, refetchActiveOrganization } =
		useActiveOrganization();
	const [toggles, setToggles] = useState(INITIAL_TOGGLES);
	const [whiteLabelOrgName, setWhiteLabelOrgName] = useState("");
	const [savingWhiteLabelName, setSavingWhiteLabelName] = useState(false);
	const [uploadingWhiteLabelLogo, setUploadingWhiteLabelLogo] =
		useState(false);

	const createUploadUrlMutation = useMutation(
		orpc.uploads.createUploadUrl.mutationOptions(),
	);
	const completeUploadMutation = useMutation(
		orpc.uploads.completeUpload.mutationOptions(),
	);

	const [ignoreLineItemProperties, setIgnoreLineItemProperties] =
		useState("");
	const [inventoryAdjustmentReasons, setInventoryAdjustmentReasons] =
		useState("");
	const [vendorsEmail, setVendorsEmail] = useState("");
	const [customersRetentionPeriod, setCustomersRetentionPeriod] =
		useState("30");
	const [fulfillmentLabelHeader, setFulfillmentLabelHeader] = useState("");
	const [fulfillmentLabelFooter, setFulfillmentLabelFooter] = useState("");
	const [itemsDefaultLengthUnit, setItemsDefaultLengthUnit] = useState("in");
	const [itemsDefaultWeightUnit, setItemsDefaultWeightUnit] = useState("lb");
	const [displayCurrency, setDisplayCurrency] = useState("usd");
	const [abcValuationMethod, setAbcValuationMethod] =
		useState("retail_value");
	const [metafieldSchemas, setMetafieldSchemas] = useState<MetafieldSchema[]>(
		[
			{
				id: "1",
				name: "Color",
				namespace: "custom",
				type: "single_line_text_field",
				required: true,
			},
			{
				id: "2",
				name: "Size",
				namespace: "custom",
				type: "single_line_text_field",
				required: false,
			},
		],
	);
	const [editingSchema, setEditingSchema] = useState<MetafieldSchema | null>(
		null,
	);
	const [newSchemaName, setNewSchemaName] = useState("");
	const [newSchemaNamespace, setNewSchemaNamespace] = useState("");
	const [newSchemaType, setNewSchemaType] = useState(
		"single_line_text_field",
	);
	const [newSchemaRequired, setNewSchemaRequired] = useState(false);

	useEffect(() => {
		setWhiteLabelOrgName(activeOrganization?.name ?? "");
	}, [activeOrganization?.name]);

	const updateToggle = (key: string, checked: boolean) => {
		setToggles((previous) => ({ ...previous, [key]: checked }));
	};

	const addMetafieldSchema = () => {
		if (newSchemaName.trim() && newSchemaNamespace.trim()) {
			const newSchema: MetafieldSchema = {
				id: Date.now().toString(),
				name: newSchemaName,
				namespace: newSchemaNamespace,
				type: newSchemaType,
				required: newSchemaRequired,
			};
			setMetafieldSchemas([...metafieldSchemas, newSchema]);
			setNewSchemaName("");
			setNewSchemaNamespace("");
			setNewSchemaType("single_line_text_field");
			setNewSchemaRequired(false);
		}
	};

	const deleteMetafieldSchema = (id: string) => {
		setMetafieldSchemas(
			metafieldSchemas.filter((schema) => schema.id !== id),
		);
	};

	const startEditingSchema = (schema: MetafieldSchema) => {
		setEditingSchema(schema);
		setNewSchemaName(schema.name);
		setNewSchemaNamespace(schema.namespace);
		setNewSchemaType(schema.type);
		setNewSchemaRequired(schema.required);
	};

	const saveEditedSchema = () => {
		if (
			editingSchema &&
			newSchemaName.trim() &&
			newSchemaNamespace.trim()
		) {
			setMetafieldSchemas(
				metafieldSchemas.map((schema) =>
					schema.id === editingSchema.id
						? {
								...schema,
								name: newSchemaName,
								namespace: newSchemaNamespace,
								type: newSchemaType,
								required: newSchemaRequired,
							}
						: schema,
				),
			);
			setEditingSchema(null);
			setNewSchemaName("");
			setNewSchemaNamespace("");
			setNewSchemaType("single_line_text_field");
			setNewSchemaRequired(false);
		}
	};

	const cancelEditingSchema = () => {
		setEditingSchema(null);
		setNewSchemaName("");
		setNewSchemaNamespace("");
		setNewSchemaType("single_line_text_field");
		setNewSchemaRequired(false);
	};

	const saveWhiteLabelOrgName = async () => {
		if (!activeOrganization || !whiteLabelOrgName.trim()) {
			return;
		}

		setSavingWhiteLabelName(true);
		try {
			const { error } = await authClient.organization.update({
				organizationId: activeOrganization.id,
				data: {
					name: whiteLabelOrgName.trim(),
				},
			});

			if (error) {
				throw error;
			}

			await refetchActiveOrganization();
			toast.success("Organization name updated");
		} catch {
			toast.error("Failed to update organization name");
		} finally {
			setSavingWhiteLabelName(false);
		}
	};

	const handleWhiteLabelLogoUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		event.target.value = "";

		if (!file || !activeOrganization) {
			return;
		}

		setUploadingWhiteLabelLogo(true);
		try {
			const { signedUploadUrl, uploadFileId } =
				await createUploadUrlMutation.mutateAsync({
					organizationId: activeOrganization.id,
					bucketKey: "avatars",
					fileName: file.name,
					mimeType: file.type || "image/png",
					scope: "ORGANIZATION_LOGO",
					metadata: {
						source: "organization-whitelable",
					},
				});

			const uploadResponse = await fetch(signedUploadUrl, {
				method: "PUT",
				body: file,
				headers: {
					"Content-Type": file.type || "image/png",
				},
			});

			if (!uploadResponse.ok) {
				throw new Error("UPLOAD_FAILED");
			}

			await completeUploadMutation.mutateAsync({
				uploadFileId,
				status: "UPLOADED",
				sizeBytes: file.size,
				linkToOrganizationLogo: true,
			});

			await refetchActiveOrganization();
			toast.success("Organization logo updated");
		} catch {
			toast.error("Failed to upload organization logo");
		} finally {
			setUploadingWhiteLabelLogo(false);
		}
	};

	return (
		<TooltipProvider>
			<div className="container mx-auto max-w-7xl py-8">
				<h1 className="font-semibold text-2xl tracking-tight">
					Organization
				</h1>
				<p className="mt-2 text-muted-foreground">
					Configure operational settings for fulfillment, inventory,
					scanning, and data policies.
				</p>

				<Tabs
					defaultValue="fulfillment"
					orientation="horizontal"
					className="mb-8 py-8 flex-col"
				>
					<div className="overflow-x-auto pb-1 max-w-2xl">
						<TabsList
							variant="line"
							className="w-max min-w-full justify-start gap-1 p-0"
						>
							{TAB_ITEMS.map((tab) => (
								<TabsTrigger
									key={tab.value}
									value={tab.value}
									className="shrink-0 whitespace-nowrap px-3"
								>
									{tab.label}
								</TabsTrigger>
							))}
						</TabsList>
					</div>

					<WhitelableTabContent
						activeOrganization={activeOrganization}
						whiteLabelOrgName={whiteLabelOrgName}
						setWhiteLabelOrgName={setWhiteLabelOrgName}
						savingWhiteLabelName={savingWhiteLabelName}
						uploadingWhiteLabelLogo={uploadingWhiteLabelLogo}
						onSaveName={saveWhiteLabelOrgName}
						onUploadLogo={handleWhiteLabelLogoUpload}
					/>
					<FulfillmentTabContent
						toggles={toggles}
						updateToggle={updateToggle}
						ignoreLineItemProperties={ignoreLineItemProperties}
						setIgnoreLineItemProperties={
							setIgnoreLineItemProperties
						}
						fulfillmentLabelHeader={fulfillmentLabelHeader}
						setFulfillmentLabelHeader={setFulfillmentLabelHeader}
						fulfillmentLabelFooter={fulfillmentLabelFooter}
						setFulfillmentLabelFooter={setFulfillmentLabelFooter}
					/>
					<InventoryTabContent
						toggles={toggles}
						updateToggle={updateToggle}
						inventoryAdjustmentReasons={inventoryAdjustmentReasons}
						setInventoryAdjustmentReasons={
							setInventoryAdjustmentReasons
						}
						abcValuationMethod={abcValuationMethod}
						setAbcValuationMethod={setAbcValuationMethod}
					/>
					<ScanningTabContent
						toggles={toggles}
						updateToggle={updateToggle}
					/>
					<UnitsTabContent
						itemsDefaultLengthUnit={itemsDefaultLengthUnit}
						setItemsDefaultLengthUnit={setItemsDefaultLengthUnit}
						itemsDefaultWeightUnit={itemsDefaultWeightUnit}
						setItemsDefaultWeightUnit={setItemsDefaultWeightUnit}
						displayCurrency={displayCurrency}
						setDisplayCurrency={setDisplayCurrency}
					/>
					<PurchaseOrdersTabContent
						toggles={toggles}
						updateToggle={updateToggle}
						vendorsEmail={vendorsEmail}
						setVendorsEmail={setVendorsEmail}
					/>
					<TransfersTabContent
						toggles={toggles}
						updateToggle={updateToggle}
					/>
					<CycleCountsTabContent
						toggles={toggles}
						updateToggle={updateToggle}
					/>
					<MetafieldSchemasTabContent
						metafieldSchemas={metafieldSchemas}
						editingSchema={editingSchema}
						cancelEditingSchema={cancelEditingSchema}
						startEditingSchema={startEditingSchema}
						deleteMetafieldSchema={deleteMetafieldSchema}
						newSchemaName={newSchemaName}
						setNewSchemaName={setNewSchemaName}
						newSchemaNamespace={newSchemaNamespace}
						setNewSchemaNamespace={setNewSchemaNamespace}
						newSchemaType={newSchemaType}
						setNewSchemaType={setNewSchemaType}
						newSchemaRequired={newSchemaRequired}
						setNewSchemaRequired={setNewSchemaRequired}
						addMetafieldSchema={addMetafieldSchema}
						saveEditedSchema={saveEditedSchema}
					/>
					<DataRetentionTabContent
						customersRetentionPeriod={customersRetentionPeriod}
						setCustomersRetentionPeriod={
							setCustomersRetentionPeriod
						}
					/>
				</Tabs>
			</div>
		</TooltipProvider>
	);
}
