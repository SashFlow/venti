"use client";

import { SidebarTrigger } from "@repo/ui/sidebar";
import { useNavigation } from "./provider";

const SideBarHeader = () => {
	const { currentModule } = useNavigation();

	return (
		<header className="flex h-[57px] shrink-0 items-center gap-2 border-b border-foreground/20 bg-primary rounded-t-xl">
			<div className="flex items-center gap-2 px-4 justify-center w-full text-center">
				{currentModule?.title || "Home"}
			</div>
			<SidebarTrigger className="absolute hidden md:flex lg:hidden justify-center items-center" />
		</header>
	);
};

export default SideBarHeader;
