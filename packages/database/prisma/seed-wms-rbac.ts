/**
 * WMS RBAC Seed
 *
 * Creates all 10 built-in roles with their managed policies and statements.
 * Fully idempotent — safe to run repeatedly. Uses upsert keyed on WmsRole.code
 * and WmsPolicy.code (globally unique, set only for built-ins).
 *
 * Run with:
 *   pnpm --filter @repo/database seed:wms-rbac
 */

import { PrismaClient } from "./generated/client";

const db = new PrismaClient();

type StatementSeed = {
	effect: "ALLOW" | "DENY";
	actions: string[];
	resources: string[];
};

type RoleSeed = {
	roleCode: string;
	roleName: string;
	roleDescription: string;
	policyCode: string;
	policyName: string;
	statements: StatementSeed[];
};

const ROLE_SEEDS: RoleSeed[] = [
	{
		roleCode: "WAREHOUSE_MANAGER",
		roleName: "Warehouse Manager",
		roleDescription:
			"Full access to all warehouse operations. Cannot access financial valuation or tenant config.",
		policyCode: "WmsWarehouseManagerPolicy",
		policyName: "Warehouse Manager Policy",
		statements: [
			{
				effect: "ALLOW",
				actions: ["*"],
				resources: [
					"wms:warehouse:*",
					"wms:product:*",
					"wms:inventory:*",
					"wms:procurement:*",
					"wms:qc:*",
					"wms:picking:*",
					"wms:dispatch:*",
					"wms:returns:*",
					"wms:replenishment:*",
					"wms:asp:*",
					"wms:deadstock:*",
					"wms:lastmile:*",
					"wms:refrigerant:*",
				],
			},
		],
	},
	{
		roleCode: "RECEIVING_STAFF",
		roleName: "Receiving Staff",
		roleDescription:
			"Can read all procurement data and create / receive GRNs. Read-only on inventory.",
		policyCode: "WmsReceivingStaffPolicy",
		policyName: "Receiving Staff Policy",
		statements: [
			{
				effect: "ALLOW",
				actions: ["read"],
				resources: ["wms:procurement:*"],
			},
			{
				effect: "ALLOW",
				actions: ["create", "receive", "update"],
				resources: ["wms:procurement:grn:*"],
			},
			{
				effect: "ALLOW",
				actions: ["read"],
				resources: ["wms:inventory:*"],
			},
		],
	},
	{
		roleCode: "PICKER",
		roleName: "Picker",
		roleDescription:
			"Can read and execute pick jobs and waves. Read-only on dispatch.",
		policyCode: "WmsPickerPolicy",
		policyName: "Picker Policy",
		statements: [
			{
				effect: "ALLOW",
				actions: ["read", "create", "pick"],
				resources: ["wms:picking:*"],
			},
			{
				effect: "ALLOW",
				actions: ["read"],
				resources: ["wms:dispatch:*"],
			},
		],
	},
	{
		roleCode: "QC_INSPECTOR",
		roleName: "QC Inspector",
		roleDescription:
			"Can perform QC inspections and read returns. Read-only on inventory.",
		policyCode: "WmsQCInspectorPolicy",
		policyName: "QC Inspector Policy",
		statements: [
			{
				effect: "ALLOW",
				actions: ["read", "create", "update", "inspect"],
				resources: ["wms:qc:*"],
			},
			{
				effect: "ALLOW",
				actions: ["read", "inspect"],
				resources: ["wms:returns:*"],
			},
			{
				effect: "ALLOW",
				actions: ["read"],
				resources: ["wms:inventory:*"],
			},
		],
	},
	{
		roleCode: "PROCUREMENT_MANAGER",
		roleName: "Procurement Manager",
		roleDescription:
			"Full access to procurement and replenishment. Read-only on valuation.",
		policyCode: "WmsProcurementManagerPolicy",
		policyName: "Procurement Manager Policy",
		statements: [
			{
				effect: "ALLOW",
				actions: ["*"],
				resources: ["wms:procurement:*"],
			},
			{
				effect: "ALLOW",
				actions: ["*"],
				resources: ["wms:replenishment:*"],
			},
			{
				effect: "ALLOW",
				actions: ["read"],
				resources: ["wms:valuation:*"],
			},
		],
	},
	{
		roleCode: "RETURNS_COORDINATOR",
		roleName: "Returns Coordinator",
		roleDescription:
			"Full access to returns, SRNs, inspection, scrap, and credit notes. Read-only on inventory.",
		policyCode: "WmsReturnsCoordinatorPolicy",
		policyName: "Returns Coordinator Policy",
		statements: [
			{
				effect: "ALLOW",
				actions: ["*"],
				resources: ["wms:returns:*"],
			},
			{
				effect: "ALLOW",
				actions: ["read"],
				resources: ["wms:inventory:*"],
			},
		],
	},
	{
		roleCode: "FINANCE",
		roleName: "Finance",
		roleDescription:
			"Full access to inventory valuation. Read-only on inventory and procurement.",
		policyCode: "WmsFinancePolicy",
		policyName: "Finance Policy",
		statements: [
			{
				effect: "ALLOW",
				actions: ["*"],
				resources: ["wms:valuation:*"],
			},
			{
				effect: "ALLOW",
				actions: ["read"],
				resources: ["wms:inventory:*", "wms:procurement:*"],
			},
		],
	},
	{
		roleCode: "INVENTORY_CONTROLLER",
		roleName: "Inventory Controller",
		roleDescription:
			"Can perform stock adjustments (requires approval), cycle counts, and dead stock review. Cannot approve their own adjustments.",
		policyCode: "WmsInventoryControllerPolicy",
		policyName: "Inventory Controller Policy",
		statements: [
			{
				// Note: "approve" is intentionally excluded — adjustments by this
				// role enter PENDING_APPROVAL status and require a Warehouse Manager
				// or Director to approve them.
				effect: "ALLOW",
				actions: [
					"read",
					"create",
					"update",
					"count",
					"adjust",
					"transfer",
				],
				resources: ["wms:inventory:*"],
			},
			{
				effect: "ALLOW",
				actions: ["read", "update"],
				resources: ["wms:deadstock:*"],
			},
		],
	},
	{
		roleCode: "ASP_COORDINATOR",
		roleName: "ASP Coordinator",
		roleDescription:
			"Full access to ASP channel (consignment, replenishment triggers, min stock). Read-only on inventory.",
		policyCode: "WmsASPCoordinatorPolicy",
		policyName: "ASP Coordinator Policy",
		statements: [
			{
				effect: "ALLOW",
				actions: ["*"],
				resources: ["wms:asp:*"],
			},
			{
				effect: "ALLOW",
				actions: ["read"],
				resources: ["wms:inventory:*"],
			},
		],
	},
	{
		roleCode: "DIRECTOR",
		roleName: "Director",
		roleDescription:
			"Read and approve access across all WMS modules. Cannot create, update, delete, or perform operational actions.",
		policyCode: "WmsDirectorPolicy",
		policyName: "Director Policy",
		statements: [
			{
				effect: "ALLOW",
				actions: ["read", "approve"],
				resources: ["wms:*"],
			},
		],
	},
];

async function seedWmsRbac() {
	console.log("Seeding WMS RBAC built-in roles and policies...\n");

	for (const seed of ROLE_SEEDS) {
		// 1. Upsert the managed policy (keyed by globally unique code)
		const policy = await db.wmsPolicy.upsert({
			where: { code: seed.policyCode },
			update: { name: seed.policyName, isManaged: true },
			create: {
				code: seed.policyCode,
				name: seed.policyName,
				isManaged: true,
				organizationId: null,
			},
		});

		// 2. Delete + recreate statements on each run for idempotency.
		//    Statements have no stable unique key, so delete-and-replace is
		//    simpler and safer than attempting content-based upserts.
		await db.wmsPolicyStatement.deleteMany({
			where: { policyId: policy.id },
		});
		await db.wmsPolicyStatement.createMany({
			data: seed.statements.map((stmt) => ({
				policyId: policy.id,
				effect: stmt.effect,
				actions: stmt.actions,
				resources: stmt.resources,
			})),
		});

		// 3. Upsert the WmsRole (keyed by globally unique code)
		const role = await db.wmsRole.upsert({
			where: { code: seed.roleCode },
			update: {
				name: seed.roleName,
				description: seed.roleDescription,
				isBuiltIn: true,
			},
			create: {
				code: seed.roleCode,
				name: seed.roleName,
				description: seed.roleDescription,
				isBuiltIn: true,
				organizationId: null,
			},
		});

		// 4. Upsert the policy attachment (idempotent via unique constraint)
		await db.wmsRolePolicyAttachment.upsert({
			where: {
				roleId_policyId: { roleId: role.id, policyId: policy.id },
			},
			update: {},
			create: { roleId: role.id, policyId: policy.id },
		});

		console.log(`  ✓ ${seed.roleName}`);
	}

	console.log(`\nSeeded ${ROLE_SEEDS.length} built-in roles.`);
}

seedWmsRbac()
	.catch((err) => {
		console.error("WMS RBAC seed failed:", err);
		process.exit(1);
	})
	.finally(() => db.$disconnect());
