import "@app/globals.css";
import "cropperjs/dist/cropper.css";
import { headingFont, inter, poppins } from "@app/fonts";
import { TooltipProvider } from "@repo/ui/tooltip";
import { cn } from "@repo/ui/utils";
import { ClientProviders } from "@shared/components/ClientProviders";
import { ConsentProvider } from "@shared/components/ConsentProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { PropsWithChildren } from "react";

export async function Document({
	children,
	locale,
	className,
}: PropsWithChildren<{ locale: string; className?: string }>) {
	return (
		<html
			lang={locale}
			suppressHydrationWarning
			className={cn(
				inter.variable,
				poppins.variable,
				headingFont.variable,
			)}
		>
			<body
				className={cn(
					"min-h-screen bg-background text-foreground antialiased",
					className,
				)}
			>
				<TooltipProvider>
					<NuqsAdapter>
						<ConsentProvider>
							<ClientProviders>{children}</ClientProviders>
						</ConsentProvider>
					</NuqsAdapter>
				</TooltipProvider>
			</body>
		</html>
	);
}
