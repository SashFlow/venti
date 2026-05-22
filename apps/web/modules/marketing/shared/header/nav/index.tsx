import { Button } from "@repo/ui/button";
import Logo from "@shared/components/Logo";
import { useRouter } from "next/navigation";
import { NavMenu } from "./Menu";
import { NavigationSheet } from "./Sheet";

const Navbar = () => {
	const router = useRouter();
	return (
		<nav className="fixed inset-x-4 top-6 mx-auto h-16 max-w-(--breakpoint-xl) rounded-full border bg-background z-50">
			<div className="mx-auto flex h-full items-center justify-between px-4">
				<Logo />

				{/* Desktop Menu */}
				<NavMenu className="hidden md:block" />

				<div className="flex items-center gap-3">
					<Button
						className="group relative overflow-hidden hidden rounded-full sm:inline-flex cursor-pointer"
						variant="outline"
						onClick={() => router.push("/auth/login")}
					>
						<span className="relative block h-5 overflow-hidden">
							<span className="flex h-5 items-center gap-x-1 transition-all duration-700 ease-custom-text-links lg:group-hover:-translate-y-full">
								Sign In
							</span>
							<span className="absolute inset-0 flex h-5 items-center gap-x-1 translate-y-full transition-all duration-700 ease-custom-text-links lg:group-hover:translate-y-0">
								Sign In
							</span>
						</span>
					</Button>
					<Button
						className="group relative overflow-hidden rounded-full cursor-pointer"
						onClick={() => router.push("/auth/signup")}
					>
						<span className="relative block h-5 overflow-hidden">
							<span className="flex h-5 items-center gap-x-1 transition-all duration-700 ease-custom-text-links lg:group-hover:-translate-y-full">
								Get Started
							</span>
							<span className="absolute inset-0 flex h-5 items-center gap-x-1 translate-y-full transition-all duration-700 ease-custom-text-links lg:group-hover:translate-y-0">
								Get Started
							</span>
						</span>
					</Button>

					{/* Mobile Menu */}
					<div className="md:hidden">
						<NavigationSheet />
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
