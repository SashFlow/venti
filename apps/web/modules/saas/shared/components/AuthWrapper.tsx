import Placeholder from "@assets/svg/placeholder.svg";
import { cn } from "@repo/ui/utils";
import { Footer } from "@saas/shared/components/Footer";
import Logo from "@shared/components/Logo";
import Image from "next/image";

import type { PropsWithChildren } from "react";

export function AuthWrapper({
	children,
	contentClass,
}: PropsWithChildren<{ contentClass?: string }>) {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Logo />
				</div>
				<div className="flex flex-1 items-center justify-center border border-border rounded-lg">
					<div className={cn("w-full max-w-xs", contentClass)}>
						{children}
					</div>
				</div>
				<Footer />
			</div>
			<div className="relative hidden bg-accent lg:flex items-center p-16 border-l">
				<Image
					src={Placeholder}
					alt="Image"
					className="object-cover w-full "
				/>
			</div>
		</div>
	);
}
