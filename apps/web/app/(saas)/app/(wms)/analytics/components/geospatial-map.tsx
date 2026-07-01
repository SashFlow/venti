"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Truck, CloudLightning } from "lucide-react";

export function GeospatialMap({ organizationId }: { organizationId: string }) {
	const { data, isLoading } = useQuery({
		...orpc.analytics.geospatialRisk.queryOptions({
			input: { organizationId },
		}),
		enabled: Boolean(organizationId),
	});

	return (
		<Card className="h-full min-h-[400px]">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MapPin className="w-5 h-5 text-primary" />
					Geospatial Risk Map
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="w-full h-[300px] bg-muted/20 animate-pulse rounded-md" />
				) : (
					<div className="relative w-full h-[300px] bg-slate-900 rounded-md overflow-hidden flex flex-col items-center justify-center border">
						{/* Concept representation of a map */}
						<div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/c/c4/Earthmap1000x500compac.jpg')] bg-cover bg-center" />

						<div className="z-10 text-center space-y-4 max-w-sm bg-black/60 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
							<h3 className="text-white font-medium text-lg">
								Active Transfer Network
							</h3>
							{data?.activeRoutes.map((route, i) => (
								<div
									key={i}
									className="flex flex-col gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-left"
								>
									<div className="flex items-center gap-2 text-red-200">
										<Truck className="w-4 h-4" />
										<span className="text-sm font-semibold">
											{route.transferOrderId} (In Transit)
										</span>
									</div>
									<div className="flex items-center gap-2 text-yellow-300 text-xs">
										<CloudLightning className="w-4 h-4" />
										<span>
											Weather Risk: {route.weatherOverlay}
										</span>
									</div>
									<p className="text-xs text-red-200 mt-1">
										{route.action}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
