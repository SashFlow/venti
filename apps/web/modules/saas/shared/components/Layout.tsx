import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";
import SideBarHeader from "@saas/shared/components/sidebar/header";
import type { PropsWithChildren } from "react";
import React from "react";
import { MobileDrawer } from "./mobile-drawer";
import { AppSidebar } from "./sidebar";
import { NavigationProvider } from "./sidebar/provider";

export async function AppLayout({ children }: PropsWithChildren) {
	// Wrap children with context provider, value will be set in page
	return (
		<SidebarProvider defaultOpen={true}>
			<NavigationProvider>
				<AppSidebar />
				<SidebarInset id="inset">
					<SideBarHeader />
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
						{children}
					</div>
				</SidebarInset>
				<MobileDrawer />
			</NavigationProvider>
		</SidebarProvider>
	);
}
