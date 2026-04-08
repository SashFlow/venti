"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui/sidebar";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { Command } from "lucide-react";
import * as React from "react";
import { NavMain } from "./main";
import { useNavigation } from "./provider";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { routes } = useNavigation();
	const { activeOrganization, activeOrganizationUserRole } =
		useActiveOrganization();

	const organizationName = activeOrganization?.name ?? "Workspace";
	const organizationRole = activeOrganizationUserRole ?? "Member";

	return (
		<Sidebar
			variant="inset"
			className="border-r border-primary/80"
			{...props}
		>
			<SidebarHeader className="bg-primary">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							asChild
							className="hover:bg-primary"
						>
							<div>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-primary">
									<Command className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium text-white">
										{organizationName}
									</span>
									<span className="truncate text-xs text-white">
										{organizationRole}
									</span>
								</div>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain
					items={[
						...routes.modules,
						...routes.services,
						...routes.management,
					]}
				/>
			</SidebarContent>
		</Sidebar>
	);
}
