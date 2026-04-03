import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@repo/ui/breadcrumb";
import { Separator } from "@repo/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@repo/ui/sidebar";
import { cookies } from "next/headers";
import type { PropsWithChildren } from "react";
import { AppSidebar } from "./sidebar";

export async function AppLayout({ children }: PropsWithChildren) {
	const cookieStore = await cookies();
	const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<SidebarInset id="inset">
				<header className="flex h-[57px] shrink-0 items-center gap-2 border-b border-black/20">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1 hidden md:flex lg:hidden justify-center items-center" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4 hidden md:block lg:hidden"
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="#">
										Build Your Application
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>
										Data Fetching
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
