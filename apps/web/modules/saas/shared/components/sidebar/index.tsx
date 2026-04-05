"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui/sidebar";
import { Command } from "lucide-react";
import * as React from "react";
import { NavMain } from "./main";
import { useNavigation } from "./provider";
import { NavUser } from "./user";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { routes } = useNavigation();

	return (
		<Sidebar
			variant="inset"
			className="border-r border-foreground/20"
			{...props}
		>
			<SidebarHeader className="border-b border-foreground/20">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<div>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Command className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										Acme Inc
									</span>
									<span className="truncate text-xs">
										Enterprise
									</span>
								</div>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain
					label="Platform"
					items={[routes.default, ...routes.modules]}
				/>
				<NavMain label="Services" items={routes.services} />
				<NavMain label="Management" items={routes.management} />
			</SidebarContent>
			<SidebarFooter className="border-t border-foreground/20">
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
