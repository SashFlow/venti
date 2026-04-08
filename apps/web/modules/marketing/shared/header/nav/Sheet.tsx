import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@repo/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@repo/ui/sheet";
import Logo from "@shared/components/Logo";
import { Menu } from "lucide-react";
import { NavMenu } from "./Menu";

export const NavigationSheet = () => {
	return (
		<Sheet>
			<VisuallyHidden>
				<SheetTitle>Navigation Menu</SheetTitle>
			</VisuallyHidden>

			<SheetTrigger asChild>
				<Button className="rounded-full" size="icon" variant="outline">
					<Menu />
				</Button>
			</SheetTrigger>
			<SheetContent className="px-6 py-3">
				<Logo />
				<NavMenu
					className="mt-6 [&>div]:h-full"
					orientation="vertical"
				/>
			</SheetContent>
		</Sheet>
	);
};
