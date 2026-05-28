import { SidebarMenuButton } from "@repo/ui/sidebar";
import { Barcode } from "lucide-react";
import React from "react";

const Scanner = () => {
	return (
		<SidebarMenuButton
			size="lg"
			className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground items-center"
		>
			<div className="h-8 w-8 rounded-lg border flex items-center justify-center">
				<Barcode />
			</div>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">SCAN</span>
			</div>
		</SidebarMenuButton>
	);
};

export default Scanner;
