"use client";

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@repo/ui/navigation-menu";
import type { ComponentProps } from "react";

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => (
	<NavigationMenu {...props}>
		<NavigationMenuList className="space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
			<NavigationMenuItem>
				<NavigationMenuLink
					href="#"
					className={navigationMenuTriggerStyle()}
				>
					Home
				</NavigationMenuLink>
			</NavigationMenuItem>
			<NavigationMenuItem>
				<NavigationMenuLink
					href="#"
					className={navigationMenuTriggerStyle()}
				>
					Blog
				</NavigationMenuLink>
			</NavigationMenuItem>
			<NavigationMenuItem>
				<NavigationMenuLink
					href="#"
					className={navigationMenuTriggerStyle()}
				>
					About
				</NavigationMenuLink>
			</NavigationMenuItem>
			<NavigationMenuItem>
				<NavigationMenuLink
					href="#"
					className={navigationMenuTriggerStyle()}
				>
					Contact Us
				</NavigationMenuLink>
			</NavigationMenuItem>
		</NavigationMenuList>
	</NavigationMenu>
);
