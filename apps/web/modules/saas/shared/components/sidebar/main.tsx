"use client";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@repo/ui/sidebar";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export function NavMain({
	items,
	label,
}: {
	label?: string;
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
		isActive?: boolean;
		sub_modules?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const pathname = usePathname();

	return (
		<SidebarGroup>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
			<SidebarMenu>
				{items.map((item) => {
					const isModuleActive = pathname.startsWith(item.url);

					return (
						<Collapsible
							key={item.title}
							asChild
							defaultOpen={isModuleActive}
						>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									tooltip={item.title}
									isActive={isModuleActive}
									className="h-10"
								>
									<a href={item.url}>
										<item.icon className="w-[24px] h-[24px]" />
										<span>{item.title}</span>
									</a>
								</SidebarMenuButton>
								{item.sub_modules?.length ? (
									<>
										<CollapsibleTrigger asChild>
											<SidebarMenuAction className="data-[state=open]:rotate-90">
												<ChevronRight />
												<span className="sr-only">
													Toggle
												</span>
											</SidebarMenuAction>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.sub_modules?.map(
													(subItem) => {
														const fullUrl = `${item.url}${subItem.url}`;
														const isSubActive =
															pathname ===
															fullUrl;

														return (
															<SidebarMenuSubItem
																key={
																	subItem.title
																}
															>
																<SidebarMenuSubButton
																	asChild
																	isActive={
																		isSubActive
																	}
																>
																	<a
																		href={
																			fullUrl
																		}
																	>
																		<span>
																			{
																				subItem.title
																			}
																		</span>
																	</a>
																</SidebarMenuSubButton>
															</SidebarMenuSubItem>
														);
													},
												)}
											</SidebarMenuSub>
										</CollapsibleContent>
									</>
								) : null}
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
