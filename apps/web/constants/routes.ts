import {
	Bot,
	Building2,
	ClipboardList,
	Download,
	LayoutDashboard,
	Package,
	PackageOpen,
	Plug,
	ShoppingCart,
	Store,
	UserCheck,
	Users,
	Users2,
	Warehouse,
} from "lucide-react";

export const NAV_ROUTES = {
	default: {
		title: "Dashboard",
		url: "/app/home",
		icon: LayoutDashboard,
	},
	modules: [
		{
			title: "Warehouse",
			url: "/app/warehouse",
			icon: Warehouse,
		},
		{
			title: "Products",
			url: "/app/products",
			icon: Package,
		},
		{
			title: "Orders",
			url: "/app/orders",
			icon: ShoppingCart,
		},
		{
			title: "Autopilot",
			url: "/app/autopilot",
			icon: Bot,
		},
		{
			title: "Workforce",
			url: "/app/workforce",
			icon: Users,
		},
		{
			title: "Vendors",
			url: "/app/vendors",
			icon: Store,
		},
		{
			title: "Customers",
			url: "/app/customers",
			icon: UserCheck,
		},
		{
			title: "Packaging",
			url: "/app/packaging",
			icon: PackageOpen,
		},
	],
	management: [
		{
			title: "Integrations",
			url: "/app/integrations",
			icon: Plug,
		},
		{
			title: "Export",
			url: "/app/export",
			icon: Download,
		},
	],
	admin: [
		{
			title: "Organization",
			url: "/app/organization",
			icon: Building2,
		},
		{
			title: "Master",
			url: "/app/master",
			icon: Users2,
		},
		{
			title: "Audit Logs",
			url: "/app/audit-logs",
			icon: ClipboardList,
		},
	],
};
