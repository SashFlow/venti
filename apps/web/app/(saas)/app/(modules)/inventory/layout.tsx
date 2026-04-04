import type { ReactNode } from "react";

interface InventoryLayoutProps {
	children: ReactNode;
}

export default function InventoryLayout({ children }: InventoryLayoutProps) {
	return (
		<div className="inventory-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">Inventory & Warehouse</h1>
				<p className="text-muted-foreground">
					Manage your inventory and warehouse operations
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
