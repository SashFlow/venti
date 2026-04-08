"use client";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui/sidebar";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useNavigation } from "./provider";

type NavItem = {
	title: string;
	url: string;
	icon: LucideIcon;
	isActive?: boolean;
	sub_modules?: {
		title: string;
		url: string;
	}[];
};

export function NavMain({
	items,
	label,
}: {
	label?: string;
	items: NavItem[];
}) {
	const pathname = usePathname();
	const { routeTo } = useNavigation();

	const moduleFromPath = React.useMemo(
		() => items.find((item) => pathname.startsWith(item.url)) ?? null,
		[items, pathname],
	);
	const [selectedModule, setSelectedModule] = React.useState<NavItem | null>(
		moduleFromPath,
	);

	React.useEffect(() => {
		setSelectedModule(moduleFromPath);
	}, [moduleFromPath]);

	React.useEffect(() => {
		if (!moduleFromPath?.sub_modules?.length) {
			return;
		}

		if (pathname !== moduleFromPath.url) {
			return;
		}

		const firstSubModule = moduleFromPath.sub_modules[0];
		routeTo(`${moduleFromPath.url}${firstSubModule.url}`);
	}, [moduleFromPath, pathname, routeTo]);

	const openModule = React.useCallback(
		(item: NavItem) => {
			if (!item.sub_modules?.length) {
				routeTo(item.url);
				return;
			}

			setSelectedModule(item);
			const firstSubModule = item.sub_modules[0];
			routeTo(`${item.url}${firstSubModule.url}`);
		},
		[routeTo],
	);

	const closeModule = React.useCallback(() => {
		setSelectedModule(null);
	}, []);

	return (
		<SidebarGroup>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
			<div className="relative overflow-hidden">
				<div
					className={`flex w-[200%] transition-transform duration-300 ease-out ${selectedModule ? "-translate-x-1/2" : "translate-x-0"}`}
				>
					<div className="w-1/2 pr-1">
						<SidebarMenu>
							{items.map((item) => {
								const isModuleActive = pathname.startsWith(
									item.url,
								);

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											onClick={() => openModule(item)}
											tooltip={item.title}
											isActive={isModuleActive}
										>
											<item.icon />
											<span>{item.title}</span>
											{item.sub_modules?.length ? (
												<ChevronRight className="ml-auto size-4 opacity-70" />
											) : null}
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</div>

					<div className="w-1/2 pl-1">
						{selectedModule ? (
							<>
								<div className="mb-2 flex items-center gap-2 px-2 relative justify-center min-h-8">
									<button
										type="button"
										onClick={closeModule}
										className="inline-flex size-7 items-center justify-center rounded-md text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute left-0"
										aria-label="Back to modules"
									>
										<ChevronLeft className="size-4" />
									</button>
									<p className="truncate text-sm font-medium">
										{selectedModule.title}
									</p>
								</div>
								<SidebarMenu>
									{selectedModule.sub_modules?.map(
										(subItem) => {
											const fullUrl = `${selectedModule.url}${subItem.url}`;
											const isSubActive =
												pathname === fullUrl;

											return (
												<SidebarMenuItem
													key={subItem.title}
												>
													<SidebarMenuButton
														onClick={() =>
															routeTo(fullUrl)
														}
														isActive={isSubActive}
													>
														<span>
															{subItem.title}
														</span>
													</SidebarMenuButton>
												</SidebarMenuItem>
											);
										},
									)}
								</SidebarMenu>
							</>
						) : null}
					</div>
				</div>
			</div>
		</SidebarGroup>
	);
}
