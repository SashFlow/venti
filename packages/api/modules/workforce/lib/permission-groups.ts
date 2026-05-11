export type PermissionGroup = {
	key: string;
	label: string;
	permissions: Array<{
		key: string;
		label: string;
	}>;
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
	{
		key: "sub-warehouse",
		label: "Sub Warehouse",
		permissions: [
			{ key: "VIEW_WAREHOUSES", label: "View sub warehouses" },
			{ key: "CREATE_WAREHOUSE", label: "Create sub warehouse" },
			{ key: "UPDATE_WAREHOUSE", label: "Update sub warehouse" },
			{ key: "DELETE_WAREHOUSE", label: "Delete sub warehouse" },
		],
	},
	{
		key: "product",
		label: "Product",
		permissions: [
			{ key: "VIEW_PRODUCTS", label: "View products" },
			{ key: "CREATE_PRODUCT", label: "Create product" },
			{ key: "UPDATE_PRODUCT", label: "Update product" },
			{ key: "DELETE_PRODUCT", label: "Delete product" },
		],
	},
	{
		key: "order",
		label: "Order",
		permissions: [
			{ key: "VIEW_INBOUND_ORDERS", label: "View inbound orders" },
			{ key: "VIEW_OUTBOUND_ORDERS", label: "View outbound orders" },
			{
				key: "VIEW_OUTBOUND_ORDER_BATCHES",
				label: "View outbound order batches",
			},
			{ key: "CREATE_INBOUND_ORDER", label: "Create inbound order" },
			{ key: "CREATE_OUTBOUND_ORDER", label: "Create outbound order" },
			{
				key: "CREATE_OUTBOUND_ORDER_BATCH",
				label: "Create outbound order batch",
			},
			{ key: "UPDATE_INBOUND_ORDER", label: "Update inbound order" },
			{ key: "UPDATE_OUTBOUND_ORDER", label: "Update outbound order" },
			{
				key: "UPDATE_OUTBOUND_ORDER_BATCH",
				label: "Update outbound order batch",
			},
			{
				key: "DELETE_OUTBOUND_ORDER_BATCH",
				label: "Delete outbound order batch",
			},
			{ key: "CANCEL_OUTBOUND_ORDER", label: "Cancel outbound order" },
		],
	},
	{
		key: "employee",
		label: "Employee",
		permissions: [
			{ key: "VIEW_EMPLOYEES", label: "View employees" },
			{
				key: "VIEW_EMPLOYEES_PRODUCTIVITY",
				label: "View employees productivity",
			},
			{ key: "CREATE_EMPLOYEE", label: "Create employee" },
			{ key: "UPDATE_EMPLOYEE", label: "Update employee" },
			{ key: "DELETE_EMPLOYEE", label: "Delete employee" },
		],
	},
	{
		key: "bin",
		label: "Bin",
		permissions: [
			{ key: "VIEW_BINS", label: "View bins" },
			{ key: "CREATE_BIN", label: "Create bin" },
			{ key: "UPDATE_BIN", label: "Update bin" },
			{ key: "DELETE_BIN", label: "Delete bin" },
		],
	},
	{
		key: "vendor",
		label: "Vendor",
		permissions: [
			{ key: "VIEW_VENDORS", label: "View vendors" },
			{ key: "CREATE_VENDOR", label: "Create vendor" },
			{ key: "UPDATE_VENDOR", label: "Update vendor" },
			{ key: "DELETE_VENDOR", label: "Delete vendor" },
		],
	},
	{
		key: "replenishment",
		label: "Replenishment",
		permissions: [
			{ key: "VIEW_REPLENISHMENTS", label: "View replenishments" },
			{ key: "CREATE_REPLENISHMENT", label: "Create replenishment" },
			{ key: "UPDATE_REPLENISHMENT", label: "Update replenishment" },
			{ key: "DELETE_REPLENISHMENT", label: "Delete replenishment" },
		],
	},
	{
		key: "customer",
		label: "Customer",
		permissions: [
			{ key: "VIEW_CUSTOMERS", label: "View customers" },
			{ key: "CREATE_CUSTOMER", label: "Create customer" },
			{ key: "UPDATE_CUSTOMER", label: "Update customer" },
			{ key: "DELETE_CUSTOMER", label: "Delete customer" },
		],
	},
	{
		key: "transfer",
		label: "Transfer",
		permissions: [
			{ key: "VIEW_TRANSFERS", label: "View transfers" },
			{ key: "CREATE_TRANSFER", label: "Create transfer" },
			{ key: "UPDATE_TRANSFERS", label: "Update transfers" },
		],
	},
	{
		key: "carrier",
		label: "Carrier",
		permissions: [
			{ key: "VIEW_CARRIERS", label: "View carriers" },
			{ key: "CREATE_CARRIER", label: "Create carrier" },
			{ key: "UPDATE_CARRIERS", label: "Update carriers" },
			{ key: "DELETE_CARRIERS", label: "Delete carriers" },
		],
	},
	{
		key: "inventory",
		label: "Inventory",
		permissions: [
			{ key: "VIEW_INVENTORY", label: "View inventory" },
			{ key: "UPDATE_INVENTORY", label: "Update inventory" },
		],
	},
	{
		key: "packaging",
		label: "Packaging",
		permissions: [
			{ key: "VIEW_PACKAGING", label: "View packaging" },
			{ key: "CREATE_PACKAGING", label: "Create packaging" },
			{ key: "UPDATE_PACKAGING", label: "Update packaging" },
			{ key: "DELETE_PACKAGING", label: "Delete packaging" },
		],
	},
	{
		key: "export",
		label: "Export",
		permissions: [
			{ key: "VIEW_EXPORT", label: "View export" },
			{ key: "VIEW_EXPORTED", label: "View exported" },
			{ key: "CREATE_EXPORT", label: "Create export" },
			{ key: "TRIGGER_EXPORT", label: "Trigger export" },
			{ key: "UPDATE_EXPORT", label: "Update export" },
			{ key: "DELETE_EXPORT", label: "Delete export" },
		],
	},
	{
		key: "webhook",
		label: "Webhook",
		permissions: [
			{ key: "VIEW_WEBHOOKS", label: "View webhooks" },
			{ key: "CREATE_WEBHOOK", label: "Create webhook" },
			{ key: "UPDATE_WEBHOOK", label: "Update webhook" },
			{ key: "DELETE_WEBHOOKS", label: "Delete webhooks" },
		],
	},
	{
		key: "company",
		label: "Company",
		permissions: [
			{ key: "UPDATE_COMPANY", label: "Update company" },
			{
				key: "UPDATE_COMPANY_BILLING",
				label: "Update company billing",
			},
			{ key: "DISABLE_USERS", label: "Disable users" },
		],
	},
];

export const ALL_PERMISSION_KEYS = new Set(
	PERMISSION_GROUPS.flatMap((group) =>
		group.permissions.map((permission) => permission.key),
	),
);
