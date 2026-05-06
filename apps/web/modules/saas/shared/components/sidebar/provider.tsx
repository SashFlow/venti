"use client";

import { NAV_ROUTES } from "@constants/routes";
import { useSidebar } from "@repo/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
	createContext,
	type PropsWithChildren,
	useContext,
	useMemo,
} from "react";

type NavRoute = {
	title: string;
	url: string;
	icon: LucideIcon;
	short_form?: string;
	sub_modules?: { title: string; url: string }[];
};

type ProfileRoute = {
	title: string;
	url: string;
};

type NavigationContextType = {
	sidebarOpen: boolean;
	setSidebarOpen: (value: boolean) => void;
	routes: typeof NAV_ROUTES;
	currentModule: NavRoute | null;
	currentRoute: ProfileRoute | null;
	setCurrentRoute: (route: ProfileRoute | null) => void;
	routeTo: (url: string) => void;
};

export const NavigationContext = createContext<NavigationContextType>({
	sidebarOpen: false,
	setSidebarOpen: () => {},
	routes: NAV_ROUTES,
	currentModule: null,
	currentRoute: null,
	setCurrentRoute: () => {},
	routeTo: () => {},
});

export function NavigationProvider({ children }: PropsWithChildren) {
	const { open, setOpen } = useSidebar();
	const router = useRouter();
	const pathname = usePathname();

	const { currentModule, currentRoute } = useMemo(() => {
		let foundModule: NavRoute | null = null;
		let foundRoute: ProfileRoute | null = null;

		const navigableGroups: NavRoute[] = [
			NAV_ROUTES.default,
			...NAV_ROUTES.modules,
			...NAV_ROUTES.management,
			...NAV_ROUTES.admin,
		];

		for (const module of navigableGroups) {
			if (pathname.startsWith(module.url)) {
				foundModule = module;

				if (module.sub_modules) {
					for (const sub of module.sub_modules) {
						const fullSubUrl = `${module.url}${sub.url}`;
						if (pathname === fullSubUrl) {
							foundRoute = sub;
							break;
						}
					}
				}
				break;
			}
		}

		// Fallback to default (Home) if no module matches and we're at /app
		if (!foundModule && pathname === NAV_ROUTES.default.url) {
			foundModule = NAV_ROUTES.default;
		}
		return { currentModule: foundModule, currentRoute: foundRoute };
	}, [pathname]);

	return (
		<NavigationContext.Provider
			value={{
				sidebarOpen: open,
				setSidebarOpen: setOpen,
				routes: NAV_ROUTES,
				currentModule,
				currentRoute,
				setCurrentRoute: (route: ProfileRoute | null) => {
					if (route?.url) {
						router.push(route.url);
					}
				},
				routeTo: (url: string) => {
					router.push(url);
				},
			}}
		>
			{children}
		</NavigationContext.Provider>
	);
}

export const useNavigation = () => {
	const context = useContext(NavigationContext);
	if (!context) {
		throw new Error(
			"useNavigation must be used within a NavigationProvider",
		);
	}
	return context;
};
