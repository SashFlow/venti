"use client";

import { NAV_ROUTES } from "@constants/routes";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { cn } from "@repo/ui/utils";
import {
	BookOpen,
	ChevronRight,
	ExternalLink,
	GripVertical,
	HelpCircle,
	Info,
	Plus,
	RotateCcw,
	Star,
	X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ALL_MODULES = [
	...NAV_ROUTES.modules,
	...NAV_ROUTES.services,
	...NAV_ROUTES.management,
];

type WidgetId =
	| "recent"
	| "favorites"
	| "explore"
	| "welcome"
	| "health"
	| "cost";

export default function HomeClient() {
	const [favorites, setFavorites] = useState<string[]>([]);
	const [recentlyVisited, setRecentlyVisited] = useState<string[]>([]);
	const [visibleWidgets, setVisibleWidgets] = useState<
		Record<WidgetId, boolean>
	>({
		recent: true,
		favorites: true,
		explore: true,
		welcome: true,
		health: true,
		cost: true,
	});

	// Load from local storage
	useEffect(() => {
		const savedFavorites = localStorage.getItem("home-favorites");
		if (savedFavorites) {
			setFavorites(JSON.parse(savedFavorites));
		}

		const savedRecent = localStorage.getItem("home-recently-visited");
		if (savedRecent) {
			setRecentlyVisited(JSON.parse(savedRecent));
		} else {
			setRecentlyVisited([
				"Finance & Accounting",
				"IAM",
				"Inventory & Warehouse",
			]);
		}

		const savedWidgets = localStorage.getItem("home-widgets");
		if (savedWidgets) {
			setVisibleWidgets(JSON.parse(savedWidgets));
		}
	}, []);

	const toggleFavorite = (title: string) => {
		const newFavorites = favorites.includes(title)
			? favorites.filter((f) => f !== title)
			: [...favorites, title];
		setFavorites(newFavorites);
		localStorage.setItem("home-favorites", JSON.stringify(newFavorites));
	};

	const addToRecent = (title: string) => {
		const newRecent = [
			title,
			...recentlyVisited.filter((t) => t !== title),
		].slice(0, 8);
		setRecentlyVisited(newRecent);
		localStorage.setItem(
			"home-recently-visited",
			JSON.stringify(newRecent),
		);
	};

	const toggleWidget = (id: WidgetId) => {
		const newWidgets = { ...visibleWidgets, [id]: !visibleWidgets[id] };
		setVisibleWidgets(newWidgets);
		localStorage.setItem("home-widgets", JSON.stringify(newWidgets));
	};

	const resetLayout = () => {
		const defaultWidgets = {
			recent: true,
			favorites: true,
			explore: true,
			welcome: true,
			health: true,
			cost: true,
		};
		setVisibleWidgets(defaultWidgets);
		localStorage.setItem("home-widgets", JSON.stringify(defaultWidgets));
	};

	const favoriteModules = ALL_MODULES.filter((m) =>
		favorites.includes(m.title),
	);
	const recentModules = ALL_MODULES.filter((m) =>
		recentlyVisited.includes(m.title),
	);

	return (
		<div className="space-y-6">
			{/* Top Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<h1 className="text-2xl font-bold tracking-tight">
						Console home
					</h1>
					<Info className="size-4 text-muted-foreground cursor-help" />
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="h-9 gap-2"
						onClick={resetLayout}
					>
						<RotateCcw className="size-4" />
						Reset to default layout
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="sm"
								className="h-9 gap-2 bg-orange-500 hover:bg-orange-600 text-white border-none"
							>
								<Plus className="size-4" />
								Add widgets
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{(
								Object.entries(visibleWidgets) as [
									WidgetId,
									boolean,
								][]
							).map(([id, visible]) => (
								<DropdownMenuCheckboxItem
									key={id}
									checked={visible}
									onCheckedChange={() => toggleWidget(id)}
								>
									{id.charAt(0).toUpperCase() + id.slice(1)}{" "}
									Widget
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Left Column */}
				<div className="lg:col-span-7 space-y-6">
					{/* Recently Visited */}
					{visibleWidgets.recent && (
						<Card className="shadow-sm relative group">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => toggleWidget("recent")}
								className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-all"
							>
								<X className="size-4 text-muted-foreground" />
							</Button>
							<CardHeader className="flex flex-row items-center justify-between py-3 space-y-0">
								<div className="flex items-center gap-2">
									<GripVertical className="size-4 text-muted-foreground cursor-move" />
									<CardTitle className="text-base font-semibold">
										Recently visited
									</CardTitle>
									<span className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">
										Info
									</span>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="size-8"
								>
									<ChevronRight className="size-4" />
								</Button>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
									{recentModules.map((module) => (
										<div
											key={module.title}
											className="flex items-center justify-between group py-1"
										>
											<Link
												href={module.url}
												onClick={() =>
													addToRecent(module.title)
												}
												className="flex items-center gap-3 hover:text-blue-600 transition-colors"
											>
												<div className="size-8 rounded bg-muted flex items-center justify-center">
													<module.icon className="size-4" />
												</div>
												<span className="text-sm font-medium">
													{module.title}
												</span>
											</Link>
										</div>
									))}
									{/* Mock some others if recent is short */}
									{recentModules.length < 6 &&
										ALL_MODULES.filter(
											(m) =>
												!recentlyVisited.includes(
													m.title,
												),
										)
											.slice(0, 6 - recentModules.length)
											.map((module) => (
												<div
													key={module.title}
													className="flex items-center justify-between group py-1"
												>
													<Link
														href={module.url}
														onClick={() =>
															addToRecent(
																module.title,
															)
														}
														className="flex items-center gap-3 hover:text-blue-600 transition-colors"
													>
														<div className="size-8 rounded bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground">
															<module.icon className="size-4" />
														</div>
														<span className="text-sm font-medium">
															{module.title}
														</span>
													</Link>
												</div>
											))}
								</div>
								<div className="mt-6 pt-4 border-t flex justify-center">
									<Button
										variant="link"
										className="text-blue-600 hover:underline h-auto p-0 text-sm"
									>
										View all services
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Favorites / Pinned Modules */}
					{visibleWidgets.favorites && (
						<Card className="shadow-sm relative group">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => toggleWidget("favorites")}
								className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-all"
							>
								<X className="size-4 text-muted-foreground" />
							</Button>
							<CardHeader className="flex flex-row items-center justify-between py-3 space-y-0">
								<div className="flex items-center gap-2">
									<GripVertical className="size-4 text-muted-foreground cursor-move" />
									<CardTitle className="text-base font-semibold">
										Favorites
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								{favorites.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/30">
										<Star className="size-8 text-muted-foreground mb-4" />
										<p className="text-sm font-medium">
											No favorite modules yet
										</p>
										<p className="text-xs text-muted-foreground mt-1 mb-4">
											Favorite modules to see them here
											for quick access.
										</p>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{favoriteModules.map((module) => (
											<Link
												key={module.title}
												href={module.url}
												onClick={() =>
													addToRecent(module.title)
												}
												className="flex items-center p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
											>
												<div className="size-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
													<module.icon className="size-5" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold truncate">
														{module.title}
													</p>
													<p className="text-xs text-muted-foreground truncate">
														{module.short_form}
													</p>
												</div>
												<Star
													className="size-4 text-yellow-500 fill-yellow-500 ml-2"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														toggleFavorite(
															module.title,
														);
													}}
												/>
											</Link>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* All Modules Grid */}
					{visibleWidgets.explore && (
						<Card className="shadow-sm relative group">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => toggleWidget("explore")}
								className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-all"
							>
								<X className="size-4 text-muted-foreground" />
							</Button>
							<CardHeader className="flex flex-row items-center justify-between py-3 space-y-0">
								<div className="flex items-center gap-2">
									<GripVertical className="size-4 text-muted-foreground cursor-move" />
									<CardTitle className="text-base font-semibold">
										Explore all modules
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
									{ALL_MODULES.map((module) => (
										<Link
											key={module.title}
											href={module.url}
											onClick={() =>
												addToRecent(module.title)
											}
											className="relative group p-4 flex flex-col items-center justify-center text-center rounded-xl border border-transparent hover:border-muted-foreground/20 hover:bg-muted/50 transition-all"
										>
											<div className="size-12 rounded-2xl bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
												<module.icon className="size-6" />
											</div>
											<span className="text-xs font-semibold leading-tight line-clamp-2">
												{module.title}
											</span>
											<Button
												variant="ghost"
												size="icon"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													toggleFavorite(
														module.title,
													);
												}}
												className={cn(
													"absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity",
													favorites.includes(
														module.title,
													)
														? "opacity-100"
														: "",
												)}
											>
												<Star
													className={cn(
														"size-3.5",
														favorites.includes(
															module.title,
														)
															? "fill-yellow-500 text-yellow-500"
															: "text-muted-foreground",
													)}
												/>
											</Button>
										</Link>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column */}
				<div className="lg:col-span-5 space-y-6">
					{/* Welcome Widget */}
					{visibleWidgets.welcome && (
						<Card className="shadow-sm relative group">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => toggleWidget("welcome")}
								className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-all"
							>
								<X className="size-4 text-muted-foreground" />
							</Button>
							<CardHeader className="flex flex-row items-center justify-between py-3 space-y-0">
								<div className="flex items-center gap-2">
									<GripVertical className="size-4 text-muted-foreground cursor-move" />
									<CardTitle className="text-base font-semibold">
										Welcome to Sashflow
									</CardTitle>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="size-8"
								>
									<ChevronRight className="size-4" />
								</Button>
							</CardHeader>
							<CardContent className="pt-0 space-y-4">
								<div className="flex items-start gap-4">
									<div className="p-2 rounded bg-blue-50">
										<BookOpen className="size-6 text-blue-600" />
									</div>
									<div>
										<h4 className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
											Getting started with Sashflow{" "}
											<ExternalLink className="size-3" />
										</h4>
										<p className="text-xs text-muted-foreground mt-1">
											Find out the fundamentals of
											Sashflow, including core concepts,
											architecture, and best practices.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="p-2 rounded bg-green-50">
										<HelpCircle className="size-6 text-green-600" />
									</div>
									<div>
										<h4 className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
											User manual & Guides{" "}
											<ExternalLink className="size-3" />
										</h4>
										<p className="text-xs text-muted-foreground mt-1">
											Explore detailed documentation for
											each module and step-by-step
											tutorials for common workflows.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Health Widget */}
					{visibleWidgets.health && (
						<Card className="shadow-sm relative group">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => toggleWidget("health")}
								className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-all"
							>
								<X className="size-4 text-muted-foreground" />
							</Button>
							<CardHeader className="flex flex-row items-center justify-between py-3 space-y-0">
								<div className="flex items-center gap-2">
									<GripVertical className="size-4 text-muted-foreground cursor-move" />
									<CardTitle className="text-base font-semibold">
										Sashflow Health
									</CardTitle>
									<span className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">
										Info
									</span>
								</div>
							</CardHeader>
							<CardContent className="pt-0 space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-xs text-muted-foreground">
										Open issues
									</span>
									<span className="text-xs font-semibold">
										0
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-xs text-muted-foreground">
										Scheduled changes
									</span>
									<span className="text-xs font-semibold">
										0
									</span>
								</div>
								<div className="flex items-center justify-between pt-2 border-t">
									<span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
										Past 7 days
									</span>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Cost and Usage Widget */}
					{visibleWidgets.cost && (
						<Card className="shadow-sm relative group">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => toggleWidget("cost")}
								className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-all"
							>
								<X className="size-4 text-muted-foreground" />
							</Button>
							<CardHeader className="flex flex-row items-center justify-between py-3 space-y-0">
								<div className="flex items-center gap-2">
									<GripVertical className="size-4 text-muted-foreground cursor-move" />
									<CardTitle className="text-base font-semibold">
										Cost and usage
									</CardTitle>
									<span className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">
										Info
									</span>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="grid grid-cols-2 gap-4 mb-4">
									<div>
										<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
											Current month
										</p>
										<div className="flex items-baseline gap-1">
											<span className="text-2xl font-bold text-blue-600">
												$206.95
											</span>
											<span className="text-[10px] text-muted-foreground">
												▼ 18%
											</span>
										</div>
									</div>
									<div>
										<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
											Cost (US$)
										</p>
										<div className="flex items-baseline gap-1">
											<span className="text-lg font-semibold">
												4K
											</span>
											<div className="w-full bg-muted h-1 rounded-full flex-1 ml-2">
												<div
													className="bg-blue-500 h-1 rounded-full"
													style={{ width: "40%" }}
												/>
											</div>
										</div>
									</div>
								</div>
								<div className="pt-4 border-t">
									<Button
										variant="link"
										className="text-blue-600 hover:underline h-auto p-0 text-sm"
									>
										Go to billing dashboard
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
