"use client";

import { Button } from "@repo/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@repo/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Input } from "@repo/ui/input";
import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { NavUser } from "@saas/shared/components/sidebar/user";
import {
	Bell,
	Bot,
	Bug,
	ChevronRight,
	Command,
	HelpCircle,
	MessageSquare,
	Plus,
	Search,
	SlidersHorizontal,
	Ticket,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "./provider";

const searchPrompts = ["Find modules", "Ask AI", "Run automation / workflows"];

const SideBarHeader = () => {
	const { routes } = useNavigation();
	const router = useRouter();
	const { user } = useSession();
	const [searchQuery, setSearchQuery] = useState("");
	const [isTicketsDialogOpen, setIsTicketsDialogOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchPromptIndex, setSearchPromptIndex] = useState(0);
	const [isMac, setIsMac] = useState(false);
	const { activeOrganization, activeOrganizationUserRole } =
		useActiveOrganization();

	const organizationName = activeOrganization?.name ?? "Sashflow";
	const organizationRole = activeOrganizationUserRole ?? "Admin";
	const userName = user?.name ?? "User";
	const userEmail = user?.email ?? "";
	const userAvatar = user?.image ?? "";
	const shortcutLabel = isMac ? "⌘ K" : "Ctrl K";

	const navigationResults = useMemo(() => {
		const groups = [routes.modules, routes.services, routes.management];
		const normalizedQuery = searchQuery.trim().toLowerCase();
		const results: {
			moduleTitle: string;
			moduleUrl: string;
			moduleIcon: any;
			submoduleTitle?: string;
			url: string;
		}[] = [];

		for (const group of groups) {
			for (const module of group) {
				results.push({
					moduleTitle: module.title,
					moduleUrl: module.url,
					moduleIcon: module.icon,
					url: module.url,
				});

				for (const submodule of module.sub_modules ?? []) {
					results.push({
						moduleTitle: module.title,
						moduleUrl: module.url,
						moduleIcon: module.icon,
						submoduleTitle: submodule.title,
						url: `${module.url}${submodule.url}`,
					});
				}
			}
		}

		if (!normalizedQuery) {
			return results.slice(0, 18);
		}

		return results
			.filter((item) => {
				const combinedLabel = [item.moduleTitle, item.submoduleTitle]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return combinedLabel.includes(normalizedQuery);
			})
			.slice(0, 24);
	}, [routes, searchQuery]);

	const moduleCards = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		const cards = routes.modules.filter((module) => {
			if (!normalizedQuery) {
				return true;
			}

			const searchableText = [
				module.title,
				...(module.sub_modules?.map((submodule) => submodule.title) ??
					[]),
			]
				.join(" ")
				.toLowerCase();

			return searchableText.includes(normalizedQuery);
		});

		return cards.slice(0, 6);
	}, [routes.modules, searchQuery]);

	const relatedPages = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		const pages = [...routes.services, ...routes.management].flatMap(
			(module) =>
				(module.sub_modules ?? []).map((submodule) => ({
					title: submodule.title,
					url: `${module.url}${submodule.url}`,
					group: module.title,
				})),
		);

		if (!normalizedQuery) {
			return pages.slice(0, 10);
		}

		return pages
			.filter((page) => {
				return `${page.title} ${page.group}`
					.toLowerCase()
					.includes(normalizedQuery);
			})
			.slice(0, 10);
	}, [routes.management, routes.services, searchQuery]);

	useEffect(() => {
		setIsMac(navigator.platform.toUpperCase().includes("MAC"));

		const handleKeyDown = (event: KeyboardEvent) => {
			const activeElement = document.activeElement;
			const isTypingInInput =
				activeElement instanceof HTMLInputElement ||
				activeElement instanceof HTMLTextAreaElement ||
				activeElement?.getAttribute("contenteditable") === "true";

			if (isTypingInInput) {
				return;
			}

			if (
				(event.metaKey || event.ctrlKey) &&
				event.key.toLowerCase() === "k"
			) {
				event.preventDefault();
				setIsSearchOpen((open) => !open);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	useEffect(() => {
		if (!isSearchOpen) {
			setSearchQuery("");

			const interval = window.setInterval(() => {
				setSearchPromptIndex(
					(currentIndex) => (currentIndex + 1) % searchPrompts.length,
				);
			}, 2200);

			return () => {
				window.clearInterval(interval);
			};
		}

		return undefined;
	}, [isSearchOpen]);

	return (
		<header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-foreground/20 bg-primary px-4 text-primary-foreground">
			<div className="flex items-center gap-2 overflow-hidden">
				<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-primary">
					<Command className="size-4" />
				</div>
				<div className="grid flex-1 text-left text-sm leading-tight">
					<span className="truncate font-medium text-white">
						{organizationName}
					</span>
					<span className="truncate text-xs text-white">
						{organizationRole}
					</span>
				</div>
			</div>

			<div className="flex-1 max-w-md mx-4 hidden md:flex">
				<Drawer
					direction="top"
					open={isSearchOpen}
					onOpenChange={setIsSearchOpen}
				>
					<DrawerTrigger asChild>
						<Button
							variant="ghost"
							className="relative w-full justify-start bg-white/10 hover:bg-white/15 border-transparent text-primary-foreground/50 hover:text-primary-foreground/80 font-normal pl-16 pr-9 h-9 group transition-colors"
						>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center size-6 rounded-md bg-white/10 ring-1 ring-white/20">
								<Bot className="h-3.5 w-3.5 text-primary-foreground/90 animate-pulse" />
							</div>
							<Search className="absolute left-10 top-1/2 -translate-y-1/2 h-4 w-4" />
							<span key={searchPrompts[searchPromptIndex]}>
								{searchPrompts[searchPromptIndex]}
							</span>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-primary-foreground/20 text-[10px] text-primary-foreground/40">
								{shortcutLabel}
							</div>
						</Button>
					</DrawerTrigger>
					<DrawerContent className="bg-background text-foreground h-[85vh] sm:h-[88vh] p-0">
						<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-full overflow-y-auto">
							<DrawerHeader className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-0 pb-4 sm:pb-5 bg-background/95 supports-backdrop-filter:bg-background/80 backdrop-blur">
								<div className="flex items-center gap-2 sm:gap-3">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											autoFocus
											placeholder="Search modules, services and submodules"
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											className="pl-10 pr-10 h-10"
										/>
										{searchQuery ? (
											<button
												type="button"
												onClick={() =>
													setSearchQuery("")
												}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
											>
												<X className="h-4 w-4" />
											</button>
										) : null}
									</div>
									<Button
										variant="outline"
										className="h-10 shrink-0"
									>
										<SlidersHorizontal className="mr-2 h-4 w-4" />
										Filter: All
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setIsSearchOpen(false)}
									>
										<X className="h-5 w-5" />
									</Button>
								</div>
								<DrawerTitle className="sr-only">
									Navigation Search
								</DrawerTitle>
								<DrawerDescription className="sr-only">
									Navigate modules and submodules quickly.
								</DrawerDescription>
							</DrawerHeader>

							<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
								<div className="space-y-8">
									<section>
										<div className="flex items-center justify-between mb-3">
											<h3 className="text-base font-semibold">
												Modules
											</h3>
											<Button
												variant="link"
												className="h-auto p-0 text-sm"
												onClick={() => {
													setIsSearchOpen(false);
													router.push("/home");
												}}
											>
												View all
											</Button>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											{moduleCards.map((module) => (
												<Card
													key={module.url}
													className="cursor-pointer hover:border-primary/60 transition-colors"
													onClick={() => {
														setIsSearchOpen(false);
														router.push(module.url);
													}}
												>
													<CardHeader className="gap-2">
														<div className="flex items-center gap-2">
															<module.icon className="h-4 w-4 text-muted-foreground" />
															<CardTitle className="text-base leading-tight">
																{module.title}
															</CardTitle>
														</div>
														<CardDescription className="line-clamp-2">
															{module.sub_modules
																?.slice(0, 2)
																.map(
																	(
																		submodule,
																	) =>
																		submodule.title,
																)
																.join(" • ")}
														</CardDescription>
													</CardHeader>
												</Card>
											))}
										</div>
									</section>

									<section>
										<h3 className="text-base font-semibold mb-3">
											Search results
										</h3>
										{navigationResults.length === 0 ? (
											<div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-lg border border-dashed">
												<Search className="h-5 w-5 mb-2" />
												<p className="text-sm">
													No results found for "
													{searchQuery}"
												</p>
											</div>
										) : (
											<div className="space-y-2">
												{navigationResults
													.slice(0, 8)
													.map((item) => (
														<Button
															key={`result-${item.url}`}
															variant="ghost"
															className="w-full h-auto justify-between px-3 py-2.5"
															onClick={() => {
																setIsSearchOpen(
																	false,
																);
																router.push(
																	item.url,
																);
															}}
														>
															<div className="text-left">
																<p className="font-medium leading-tight">
																	{item.submoduleTitle ??
																		item.moduleTitle}
																</p>
																<p className="text-xs text-muted-foreground mt-0.5">
																	{item.submoduleTitle
																		? item.moduleTitle
																		: "Module"}
																</p>
															</div>
															<ChevronRight className="h-4 w-4 text-muted-foreground" />
														</Button>
													))}
											</div>
										)}
									</section>
								</div>

								<aside className="space-y-6">
									<section>
										<h3 className="text-base font-semibold mb-3">
											Related pages
										</h3>
										<div className="space-y-2">
											{relatedPages.map((page) => (
												<Button
													key={`related-${page.url}`}
													variant="link"
													className="h-auto p-0 justify-start text-left whitespace-normal"
													onClick={() => {
														setIsSearchOpen(false);
														router.push(page.url);
													}}
												>
													{page.title}
												</Button>
											))}
										</div>
									</section>
								</aside>
							</div>
						</div>
					</DrawerContent>
				</Drawer>
			</div>

			<div className="flex items-center gap-1 sm:gap-2">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full text-secondary border-secondary border-2 bg-white hover:bg-white/80"
				>
					<Bell className="h-5 w-5" />
					<span className="sr-only">Notifications</span>
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="default"
							size="icon"
							className="rounded-full text-primary border-primary border-2 bg-white hover:bg-white/80"
						>
							<HelpCircle className="h-5 w-5" />
							<span className="sr-only">Help</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56 p-1">
						<DropdownMenuItem className="cursor-pointer py-2.5 rounded-md">
							<MessageSquare className="mr-3 h-4 w-4 text-muted-foreground" />
							<div className="flex flex-col">
								<span className="font-medium">Feedback</span>
								<span className="text-[10px] text-muted-foreground leading-none">
									Share your thoughts
								</span>
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="cursor-pointer py-2.5 rounded-md"
							onClick={() => setIsTicketsDialogOpen(true)}
						>
							<Ticket className="mr-3 h-4 w-4 text-muted-foreground" />
							<div className="flex flex-col">
								<span className="font-medium">Tickets</span>
								<span className="text-[10px] text-muted-foreground leading-none">
									Get help or report issues
								</span>
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<NavUser
					user={{
						name: userName,
						email: userEmail,
						avatar: userAvatar,
					}}
				/>
				<Dialog
					open={isTicketsDialogOpen}
					onOpenChange={setIsTicketsDialogOpen}
				>
					<DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl">
						<div className="bg-primary p-8 text-primary-foreground">
							<DialogHeader>
								<DialogTitle className="text-2xl font-bold">
									How can we help?
								</DialogTitle>
								<DialogDescription className="text-primary-foreground/70 text-base">
									Select an option below to get started with
									your request.
								</DialogDescription>
							</DialogHeader>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-background">
							<Card
								className="cursor-pointer border-2 border-transparent hover:border-primary hover:shadow-md transition-all group"
								onClick={() => setIsTicketsDialogOpen(false)}
							>
								<CardHeader>
									<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
										<Plus className="h-6 w-6 text-primary" />
									</div>
									<CardTitle className="text-lg">
										Feature Request
									</CardTitle>
									<CardDescription className="text-sm">
										Have an idea to make our platform
										better? We'd love to hear it!
									</CardDescription>
								</CardHeader>
							</Card>
							<Card
								className="cursor-pointer border-2 border-transparent hover:border-destructive hover:shadow-md transition-all group"
								onClick={() => setIsTicketsDialogOpen(false)}
							>
								<CardHeader>
									<div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
										<Bug className="h-6 w-6 text-destructive" />
									</div>
									<CardTitle className="text-lg">
										Report Issue
									</CardTitle>
									<CardDescription className="text-sm">
										Found something not working? Let us know
										so we can fix it.
									</CardDescription>
								</CardHeader>
							</Card>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</header>
	);
};

export default SideBarHeader;
