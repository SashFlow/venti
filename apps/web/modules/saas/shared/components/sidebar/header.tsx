"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@repo/ui/breadcrumb";
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
import { SidebarTrigger } from "@repo/ui/sidebar";
import {
	Bell,
	Bug,
	HelpCircle,
	MessageSquare,
	Plus,
	Search,
	Ticket,
} from "lucide-react";
import { useState } from "react";
import { useNavigation } from "./provider";

const SideBarHeader = () => {
	const { currentModule, currentRoute } = useNavigation();
	const [searchQuery, setSearchQuery] = useState("");
	const [isTicketsDialogOpen, setIsTicketsDialogOpen] = useState(false);

	return (
		<header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-foreground/20 bg-primary px-4 text-primary-foreground">
			<div className="flex items-center gap-2 overflow-hidden">
				<SidebarTrigger className="text-primary-foreground md:flex lg:hidden" />
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem className="hidden sm:inline-flex">
							<BreadcrumbLink
								href="/app/home"
								className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
							>
								App
							</BreadcrumbLink>
						</BreadcrumbItem>
						{currentModule && (
							<>
								<BreadcrumbSeparator className="text-primary-foreground/40 hidden sm:block" />
								<BreadcrumbItem>
									<BreadcrumbLink
										href={currentModule.url}
										className="text-primary-foreground/70 hover:text-primary-foreground transition-colors truncate max-w-[100px] sm:max-w-none"
									>
										{currentModule.title}
									</BreadcrumbLink>
								</BreadcrumbItem>
							</>
						)}
						{currentRoute && (
							<>
								<BreadcrumbSeparator className="text-primary-foreground/40" />
								<BreadcrumbItem>
									<BreadcrumbPage className="font-medium text-primary-foreground truncate max-w-[100px] sm:max-w-none">
										{currentRoute.title}
									</BreadcrumbPage>
								</BreadcrumbItem>
							</>
						)}
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<div className="flex-1 max-w-md mx-4 hidden md:flex">
				<Drawer direction="top">
					<DrawerTrigger asChild>
						<Button
							variant="ghost"
							className="relative w-full justify-start bg-white/10 hover:bg-white/15 border-transparent text-primary-foreground/50 hover:text-primary-foreground/80 font-normal px-9 h-9 group transition-colors"
						>
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
							<span>Search...</span>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-primary-foreground/20 text-[10px] text-primary-foreground/40">
								⌘ K
							</div>
						</Button>
					</DrawerTrigger>
					<DrawerContent className="bg-background text-foreground">
						<div className="mx-auto w-full max-w-2xl p-6">
							<DrawerHeader>
								<DrawerTitle className="text-2xl font-bold">
									Search
								</DrawerTitle>
								<DrawerDescription>
									Find anything across the workspace.
								</DrawerDescription>
							</DrawerHeader>
							<div className="mt-4">
								<div className="relative">
									<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
									<Input
										autoFocus
										placeholder="Type to search..."
										value={searchQuery}
										onChange={(e) =>
											setSearchQuery(e.target.value)
										}
										className="pl-12 py-7 text-lg bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
									/>
								</div>
								<div className="mt-8 min-h-[300px]">
									{searchQuery ? (
										<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
											<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
												<Search className="h-6 w-6" />
											</div>
											<p className="text-lg font-medium">
												No results found
											</p>
											<p className="text-sm">
												We couldn't find anything
												matching "{searchQuery}"
											</p>
										</div>
									) : (
										<div className="space-y-6">
											<div>
												<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
													Recent
												</h3>
												<div className="grid grid-cols-1 gap-2">
													{[
														"Dashboard",
														"Settings",
														"Billing",
													].map((item) => (
														<Button
															key={item}
															variant="ghost"
															className="w-full justify-between px-4 py-6 h-auto hover:bg-muted transition-colors group"
														>
															<span className="font-medium">
																{item}
															</span>
															<span className="text-xs text-muted-foreground group-hover:text-foreground">
																Jump to
															</span>
														</Button>
													))}
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</DrawerContent>
				</Drawer>
			</div>

			<div className="flex items-center gap-1 sm:gap-2">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full text-primary-foreground hover:bg-white/10"
				>
					<Bell className="h-5 w-5" />
					<span className="sr-only">Notifications</span>
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full text-primary-foreground hover:bg-white/10"
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
