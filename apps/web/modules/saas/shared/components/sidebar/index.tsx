"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@repo/ui/sidebar";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { Command } from "lucide-react";
import * as React from "react";
import Scanner from "../scanner";
import { NavMain } from "./main";
import { useNavigation } from "./provider";
import { NavUser } from "./user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { routes } = useNavigation();
	const { user, organization } = useSession();

	return (
		<Sidebar
			variant="inset"
			className="border-r border-foreground/20"
			{...props}
		>
			<SidebarHeader className="border-b border-foreground/20 max-h-16">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<div>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Command className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{organization?.name || config.appName}
									</span>
									<span className="truncate text-xs">
										{organization?.slug || "Workspace"}
									</span>
								</div>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={[routes.default, ...routes.modules]} />
				<NavMain label="Management" items={routes.management} />
				{/* <NavMain label="Admin" items={routes.admin} /> */}
			</SidebarContent>
			<SidebarFooter className="border-t border-foreground/20">
				<Scanner />
				<SidebarSeparator className="m-0" />
				<NavUser
					user={{
						email: user?.email || "",
						name: user?.name || "",
						avatar: user?.image || "",
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
