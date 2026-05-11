"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { TooltipProvider } from "@repo/ui/tooltip";
import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

type JsonObject = Record<string, unknown>;

const asObject = (value: unknown): JsonObject => {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return {};
	}

	return value as JsonObject;
};

const readBoolean = (
	source: JsonObject,
	key: string,
	fallback: boolean,
): boolean => {
	const value = source[key];
	return typeof value === "boolean" ? value : fallback;
};

const readString = (source: JsonObject, key: string, fallback = ""): string => {
	const value = source[key];
	return typeof value === "string" ? value : fallback;
};

const parseMetafieldSchemas = (value: unknown): MetafieldSchema[] | null => {
	if (!Array.isArray(value)) {
		return null;
	}

	const parsed = value
		.map((item) => {
			if (!item || typeof item !== "object" || Array.isArray(item)) {
				return null;
			}

			const record = item as Record<string, unknown>;
			const id = typeof record.id === "string" ? record.id : "";
			const name = typeof record.name === "string" ? record.name : "";
			const namespace =
				typeof record.namespace === "string" ? record.namespace : "";
			const type = typeof record.type === "string" ? record.type : "";
			const required =
				typeof record.required === "boolean" ? record.required : false;

			if (!id || !name || !namespace || !type) {
				return null;
			}

			return {
				id,
				name,
				namespace,
				type,
				required,
			} satisfies MetafieldSchema;
		})
		.filter((schema): schema is MetafieldSchema => Boolean(schema));

	return parsed.length > 0 ? parsed : [];
};

export default function OrganizationPage() {
	const { organization: sessionOrganization, session } = useSession();
	const { activeOrganization, refetchActiveOrganization } =
		useActiveOrganization();
	const resolvedOrganization = activeOrganization ?? sessionOrganization;
	const queryClient = useQueryClient();
	// Derive org ID: prefer loaded org objects, fall back to session.activeOrganizationId
	// which is available as soon as the session query resolves (before full org loads).
	const activeOrganizationId =
		activeOrganization?.id ??
		sessionOrganization?.id ??
		session?.activeOrganizationId;
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
	const upsertOrganizationConfigMutation = useMutation(
		orpc.organizations.upsertConfig.mutationOptions(),
	);

	const { data: organizationConfigData } = useQuery({
		...orpc.organizations.getConfig.queryOptions({
			input: {
				organizationId: activeOrganizationId ?? "",
			},
		}),
		enabled: Boolean(activeOrganizationId),
	});

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
		setWhiteLabelOrgName(resolvedOrganization?.name ?? "");
	}, [resolvedOrganization?.name]);

	useEffect(() => {
		if (!activeOrganizationId) {
			return;
		}

		queryClient.prefetchQuery(
			orpc.organizations.getConfig.queryOptions({
				input: {
					organizationId: activeOrganizationId,
				},
			}),
		);
	}, [activeOrganizationId, queryClient]);

	useEffect(() => {
		const config = organizationConfigData?.config;

		if (!config) {
			return;
		}

		const fulfillment = asObject(config.fulfillment);
		const inventory = asObject(config.inventory);
		const units = asObject(config.units);
		const barcodeScanner = asObject(config.barcodeScanner);
		const purchaseOrders = asObject(config.purchaseOrders);
		const transfers = asObject(config.transfers);
		const cycleCount = asObject(config.cycleCount);
		const dataRetention = asObject(config.dataRetention);

		setToggles((previous) => ({
			...previous,
			outbound_markShipmentAsFulfilled: readBoolean(
				fulfillment,
				"outbound_markShipmentAsFulfilled",
				previous.outbound_markShipmentAsFulfilled,
			),
			batch_notifyCustomerFulfilled: readBoolean(
				fulfillment,
				"batch_notifyCustomerFulfilled",
				previous.batch_notifyCustomerFulfilled,
			),
			batch_useShopifyTrackingPage: readBoolean(
				fulfillment,
				"batch_useShopifyTrackingPage",
				previous.batch_useShopifyTrackingPage,
			),
			batch_generateBarcodes: readBoolean(
				fulfillment,
				"batch_generateBarcodes",
				previous.batch_generateBarcodes,
			),
			batch_partialFulfillment: readBoolean(
				fulfillment,
				"batch_partialFulfillment",
				previous.batch_partialFulfillment,
			),
			batch_printPickSlip: readBoolean(
				fulfillment,
				"batch_printPickSlip",
				previous.batch_printPickSlip,
			),
			batch_packAll: readBoolean(
				fulfillment,
				"batch_packAll",
				previous.batch_packAll,
			),
			batch_printLicensePlate: readBoolean(
				fulfillment,
				"batch_printLicensePlate",
				previous.batch_printLicensePlate,
			),
			inventory_enableInternalReplenishment: readBoolean(
				inventory,
				"inventory_enableInternalReplenishment",
				previous.inventory_enableInternalReplenishment,
			),
			inventory_enableKitting: readBoolean(
				inventory,
				"inventory_enableKitting",
				previous.inventory_enableKitting,
			),
			inventory_packaging: readBoolean(
				inventory,
				"inventory_packaging",
				previous.inventory_packaging,
			),
			inventory_retainEmptyRecords: readBoolean(
				inventory,
				"inventory_retainEmptyRecords",
				previous.inventory_retainEmptyRecords,
			),
			inventory_adjustmentReasonRequired: readBoolean(
				inventory,
				"inventory_adjustmentReasonRequired",
				previous.inventory_adjustmentReasonRequired,
			),
			inventory_enableSerialization: readBoolean(
				inventory,
				"inventory_enableSerialization",
				previous.inventory_enableSerialization,
			),
			inventory_enableExpirationTracking: readBoolean(
				inventory,
				"inventory_enableExpirationTracking",
				previous.inventory_enableExpirationTracking,
			),
			inventory_enableLotClassifications: readBoolean(
				inventory,
				"inventory_enableLotClassifications",
				previous.inventory_enableLotClassifications,
			),
			inventory_oneLotPerBin: readBoolean(
				inventory,
				"inventory_oneLotPerBin",
				previous.inventory_oneLotPerBin,
			),
			inventory_expirationAsDate: readBoolean(
				inventory,
				"inventory_expirationAsDate",
				previous.inventory_expirationAsDate,
			),
			inventory_abc_enabled: readBoolean(
				inventory,
				"inventory_abc_enabled",
				previous.inventory_abc_enabled,
			),
			inventory_enableCostTracking: readBoolean(
				inventory,
				"inventory_enableCostTracking",
				previous.inventory_enableCostTracking,
			),
			batch_scanBinWhenRemovingFromBin: readBoolean(
				barcodeScanner,
				"batch_scanBinWhenRemovingFromBin",
				previous.batch_scanBinWhenRemovingFromBin,
			),
			batch_scanItemWhenRemovingFromBin: readBoolean(
				barcodeScanner,
				"batch_scanItemWhenRemovingFromBin",
				previous.batch_scanItemWhenRemovingFromBin,
			),
			batch_scanEachItem: readBoolean(
				barcodeScanner,
				"batch_scanEachItem",
				previous.batch_scanEachItem,
			),
			batch_scanItemWhenAddingToShipment: readBoolean(
				barcodeScanner,
				"batch_scanItemWhenAddingToShipment",
				previous.batch_scanItemWhenAddingToShipment,
			),
			userConfig_enableCameraScanner: readBoolean(
				barcodeScanner,
				"userConfig_enableCameraScanner",
				previous.userConfig_enableCameraScanner,
			),
			userConfig_enableDevScanner: readBoolean(
				barcodeScanner,
				"userConfig_enableDevScanner",
				previous.userConfig_enableDevScanner,
			),
			userConfig_enableNativeScanner: readBoolean(
				barcodeScanner,
				"userConfig_enableNativeScanner",
				previous.userConfig_enableNativeScanner,
			),
			scanPrefixValue: readBoolean(
				barcodeScanner,
				"scanPrefixValue",
				previous.scanPrefixValue,
			),
			inventory_enablePurchaseOrders: readBoolean(
				purchaseOrders,
				"inventory_enablePurchaseOrders",
				previous.inventory_enablePurchaseOrders,
			),
			checkin_enableBinCriteria: readBoolean(
				purchaseOrders,
				"checkin_enableBinCriteria",
				previous.checkin_enableBinCriteria,
			),
			po_oneStepCheckIn: readBoolean(
				purchaseOrders,
				"po_oneStepCheckIn",
				previous.po_oneStepCheckIn,
			),
			po_editClosed: readBoolean(
				purchaseOrders,
				"po_editClosed",
				previous.po_editClosed,
			),
			transfers_enabled: readBoolean(
				transfers,
				"transfers_enabled",
				previous.transfers_enabled,
			),
			transfers_editClosed: readBoolean(
				transfers,
				"transfers_editClosed",
				previous.transfers_editClosed,
			),
			transfers_oneStepCheckIn: readBoolean(
				transfers,
				"transfers_oneStepCheckIn",
				previous.transfers_oneStepCheckIn,
			),
			transfers_enableOverCounting: readBoolean(
				transfers,
				"transfers_enableOverCounting",
				previous.transfers_enableOverCounting,
			),
			cycleCounts_enabled: readBoolean(
				cycleCount,
				"cycleCounts_enabled",
				previous.cycleCounts_enabled,
			),
			cycleCounts_scanBin: readBoolean(
				cycleCount,
				"cycleCounts_scanBin",
				previous.cycleCounts_scanBin,
			),
			cycleCounts_scanItem: readBoolean(
				cycleCount,
				"cycleCounts_scanItem",
				previous.cycleCounts_scanItem,
			),
			cycleCounts_showQty: readBoolean(
				cycleCount,
				"cycleCounts_showQty",
				previous.cycleCounts_showQty,
			),
		}));

		setIgnoreLineItemProperties(
			readString(fulfillment, "ignoreLineItemProperties", ""),
		);
		setFulfillmentLabelHeader(
			readString(fulfillment, "fulfillmentLabelHeader", ""),
		);
		setFulfillmentLabelFooter(
			readString(fulfillment, "fulfillmentLabelFooter", ""),
		);
		setInventoryAdjustmentReasons(
			readString(inventory, "inventoryAdjustmentReasons", ""),
		);
		setAbcValuationMethod(
			readString(inventory, "abcValuationMethod", "retail_value"),
		);
		setItemsDefaultLengthUnit(
			readString(units, "itemsDefaultLengthUnit", "in"),
		);
		setItemsDefaultWeightUnit(
			readString(units, "itemsDefaultWeightUnit", "lb"),
		);
		setDisplayCurrency(readString(units, "displayCurrency", "usd"));
		setVendorsEmail(readString(purchaseOrders, "vendorsEmail", ""));
		setCustomersRetentionPeriod(
			readString(dataRetention, "customersRetentionPeriod", "30"),
		);

		const loadedSchemas = parseMetafieldSchemas(
			purchaseOrders.metafieldSchemas,
		);
		if (loadedSchemas) {
			setMetafieldSchemas(loadedSchemas);
		}
	}, [organizationConfigData?.config]);

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
		if (!resolvedOrganization || !whiteLabelOrgName.trim()) {
			return;
		}

		setSavingWhiteLabelName(true);
		try {
			const { error } = await authClient.organization.update({
				organizationId: resolvedOrganization.id,
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

		if (!file || !resolvedOrganization) {
			return;
		}

		setUploadingWhiteLabelLogo(true);
		try {
			const { signedUploadUrl, uploadFileId } =
				await createUploadUrlMutation.mutateAsync({
					organizationId: resolvedOrganization.id,
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

	const saveOrganizationConfig = async () => {
		if (!activeOrganizationId) {
			return;
		}

		try {
			await upsertOrganizationConfigMutation.mutateAsync({
				organizationId: activeOrganizationId,
				fulfillment: {
					outbound_markShipmentAsFulfilled:
						toggles.outbound_markShipmentAsFulfilled,
					batch_notifyCustomerFulfilled:
						toggles.batch_notifyCustomerFulfilled,
					batch_useShopifyTrackingPage:
						toggles.batch_useShopifyTrackingPage,
					batch_generateBarcodes: toggles.batch_generateBarcodes,
					batch_partialFulfillment: toggles.batch_partialFulfillment,
					batch_printPickSlip: toggles.batch_printPickSlip,
					batch_packAll: toggles.batch_packAll,
					batch_printLicensePlate: toggles.batch_printLicensePlate,
					ignoreLineItemProperties,
					fulfillmentLabelHeader,
					fulfillmentLabelFooter,
				},
				inventory: {
					inventoryAdjustmentReasons,
					inventory_enableInternalReplenishment:
						toggles.inventory_enableInternalReplenishment,
					inventory_enableKitting: toggles.inventory_enableKitting,
					inventory_packaging: toggles.inventory_packaging,
					inventory_retainEmptyRecords:
						toggles.inventory_retainEmptyRecords,
					inventory_adjustmentReasonRequired:
						toggles.inventory_adjustmentReasonRequired,
					inventory_enableSerialization:
						toggles.inventory_enableSerialization,
					inventory_enableExpirationTracking:
						toggles.inventory_enableExpirationTracking,
					inventory_enableLotClassifications:
						toggles.inventory_enableLotClassifications,
					inventory_oneLotPerBin: toggles.inventory_oneLotPerBin,
					inventory_expirationAsDate:
						toggles.inventory_expirationAsDate,
					inventory_abc_enabled: toggles.inventory_abc_enabled,
					abcValuationMethod,
					inventory_enableCostTracking:
						toggles.inventory_enableCostTracking,
				},
				units: {
					itemsDefaultLengthUnit,
					itemsDefaultWeightUnit,
					displayCurrency,
				},
				barcodeScanner: {
					batch_scanBinWhenRemovingFromBin:
						toggles.batch_scanBinWhenRemovingFromBin,
					batch_scanItemWhenRemovingFromBin:
						toggles.batch_scanItemWhenRemovingFromBin,
					batch_scanEachItem: toggles.batch_scanEachItem,
					batch_scanItemWhenAddingToShipment:
						toggles.batch_scanItemWhenAddingToShipment,
					userConfig_enableCameraScanner:
						toggles.userConfig_enableCameraScanner,
					userConfig_enableDevScanner:
						toggles.userConfig_enableDevScanner,
					userConfig_enableNativeScanner:
						toggles.userConfig_enableNativeScanner,
					scanPrefixValue: toggles.scanPrefixValue,
				},
				purchaseOrders: {
					inventory_enablePurchaseOrders:
						toggles.inventory_enablePurchaseOrders,
					checkin_enableBinCriteria:
						toggles.checkin_enableBinCriteria,
					po_oneStepCheckIn: toggles.po_oneStepCheckIn,
					po_editClosed: toggles.po_editClosed,
					vendorsEmail,
					metafieldSchemas,
				},
				transfers: {
					transfers_enabled: toggles.transfers_enabled,
					transfers_editClosed: toggles.transfers_editClosed,
					transfers_oneStepCheckIn: toggles.transfers_oneStepCheckIn,
					transfers_enableOverCounting:
						toggles.transfers_enableOverCounting,
				},
				cycleCount: {
					cycleCounts_enabled: toggles.cycleCounts_enabled,
					cycleCounts_scanBin: toggles.cycleCounts_scanBin,
					cycleCounts_scanItem: toggles.cycleCounts_scanItem,
					cycleCounts_showQty: toggles.cycleCounts_showQty,
				},
				dataRetention: {
					customersRetentionPeriod,
				},
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.organizations.getConfig.queryOptions({
					input: {
						organizationId: activeOrganizationId,
					},
				}).queryKey,
			});

			toast.success("Organization configuration saved");
		} catch {
			toast.error("Failed to save organization configuration");
		}
	};

	return (
		<TooltipProvider>
			<div className="container mx-auto max-w-7xl py-8">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h1 className="font-semibold text-2xl tracking-tight">
						Organization
					</h1>
					<Button
						type="button"
						onClick={saveOrganizationConfig}
						disabled={
							!activeOrganizationId ||
							upsertOrganizationConfigMutation.isPending
						}
					>
						{upsertOrganizationConfigMutation.isPending
							? "Saving Config..."
							: "Save Config"}
					</Button>
				</div>
				<p className="mt-2 text-muted-foreground">
					Configure operational settings for fulfillment, inventory,
					scanning, and data policies.
				</p>

				<Tabs
					defaultValue="whitelabel"
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
						activeOrganization={resolvedOrganization}
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
