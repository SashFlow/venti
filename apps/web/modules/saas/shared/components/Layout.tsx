import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@repo/ui/sidebar";
import { cookies } from "next/headers";
import type { PropsWithChildren } from "react";
import { MobileDrawer } from "./mobile-drawer";
import { AppSidebar } from "./sidebar";

export async function AppLayout({ children }: PropsWithChildren) {
	const cookieStore = await cookies();
	const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<SidebarInset id="inset" className="p-0">
				<header className="flex h-[57px] shrink-0 items-center gap-2 border-b border-foreground/20">
					<div className="flex items-center gap-2 px-4 justify-center w-full text-center">
						Title
					</div>
					<SidebarTrigger className="absolute hidden md:flex lg:hidden justify-center items-center" />
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					{children}
				</div>
			</SidebarInset>
			<MobileDrawer />
		</SidebarProvider>
	);
}
