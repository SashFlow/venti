import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	Activity,
	ArrowRight,
	Box,
	CheckCircle2,
	MapPin,
	Shield,
	Truck,
} from "lucide-react";
import { setRequestLocale } from "next-intl/server";

const features = [
	{
		step: "01",
		category: "INBOUND",
		subtitle: "RECEIVING & DOCK MANAGEMENT",
		title: "Trucks in, pallets ",
		titleHighlight: "accounted for.",
		description:
			"Every ASN lands as a drag-and-drop receiving task. Scan any barcode format at the dock, auto-reconcile against the PO, and flag discrepancies before the truck pulls out. Dock scheduling runs 15-minute windows — no more parking lot backups.",
		specs: [
			{
				label: "Supported barcode formats",
				value: "GS1-128, QR, DataMatrix, SSCC, ITF-14",
			},
			{
				label: "ASN processing time",
				value: "< 200ms per line",
				highlight: true,
			},
			{
				label: "Receiving modes",
				value: "Blind, PO-matched, Cross-dock",
			},
			{ label: "Dock appointment windows", value: "15-min granularity" },
			{
				label: "Discrepancy auto-flag",
				value: "±2% tolerance, configurable",
				highlight: true,
			},
			{
				label: "Concurrent receiving sessions",
				value: "Unlimited",
				highlight: true,
			},
		],
		mockup: <InboundMockup />,
	},
	{
		step: "02",
		category: "STORAGE",
		subtitle: "BIN LOCATIONS & SLOTTING",
		title: "Every pallet ",
		titleHighlight: "in its slot.",
		description:
			"Draw your warehouse floor, define aisles and bays, set slotting rules that auto-assign incoming inventory by velocity, weight, or custom logic. 500,000 locations. Zero spreadsheets.",
		specs: [
			{
				label: "Location addressing formats",
				value: "Aisle-Bay-Level-Position, custom",
			},
			{
				label: "Max locations per warehouse",
				value: "500,000+",
				highlight: true,
			},
			{
				label: "Slotting rule conditions",
				value: "Up to 24 conditions per rule",
				highlight: true,
			},
			{
				label: "Cycle count frequency",
				value: "Daily, weekly, ABC, random",
			},
			{
				label: "Mixed-SKU bin support",
				value: "Yes, with conflict detection",
			},
			{
				label: "Replenishment trigger",
				value: "Min/max, demand-driven, manual",
			},
		],
		mockup: <StorageMockup />,
	},
	{
		step: "03",
		category: "PICKING",
		subtitle: "PICK PATH OPTIMIZATION",
		title: "Every forklift ",
		titleHighlight: "moving with purpose.",
		description:
			"Wave, batch, cluster, or zone — pick methods that match your floor, not the other way around. The path optimizer shaves 31% off travel distance on day one. Scan-confirm catches errors before they reach the pack station.",
		specs: [
			{
				label: "Pick methods",
				value: "Wave, batch, cluster, zone, FIFO",
			},
			{
				label: "Path optimization algorithm",
				value: "S-shape + optimal routing",
				highlight: true,
			},
			{
				label: "Avg. distance reduction",
				value: "31% vs. unoptimized",
				highlight: true,
			},
			{
				label: "Barcode confirm required",
				value: "Yes, configurable per zone",
			},
			{ label: "Pick-to-light integration", value: "Supported via API" },
			{
				label: "Error interception",
				value: "Real-time, before pack station",
				highlight: true,
			},
		],
		mockup: <PickingMockup />,
	},
	{
		step: "04",
		category: "PACKING",
		subtitle: "PACK STATIONS & RULES ENGINE",
		title: "Rules that pack ",
		titleHighlight: "smarter, not harder.",
		description:
			"48 conditions per packing workflow. Cartonization picks the right box automatically. Fragile, high-value, hazmat — every rule fires before the label prints. Pack stations hit 420 orders per shift without a single override.",
		specs: [
			{
				label: "Rules-engine conditions per workflow",
				value: "Up to 48 conditions",
				highlight: true,
			},
			{
				label: "Cartonization algorithm",
				value: "Weight + volume optimization",
			},
			{
				label: "Pack station throughput",
				value: "420 orders/station/shift",
				highlight: true,
			},
			{
				label: "Double-scan verification",
				value: "Configurable by value threshold",
			},
			{ label: "Custom packing slips", value: "HTML template editor" },
			{
				label: "Hazmat compliance flags",
				value: "IATA, DOT, IMDG supported",
			},
		],
		mockup: <PackingMockup />,
	},
	{
		step: "05",
		category: "SHIPPING",
		subtitle: "CARRIER INTEGRATIONS & RATE SHOPPING",
		title: "Labels in 400ms, ",
		titleHighlight: "rules in minutes.",
		description:
			"Five major carriers, rate-shopped in under 400 milliseconds. Unlimited shipping rules — force USPS for light residential, escalate to FedEx Priority for enterprise SLAs. End-of-day manifests auto-generate. Returns labels print in-box or on-demand.",
		specs: [
			{
				label: "Native carrier integrations",
				value: "UPS, FedEx, USPS, DHL, OnTrac",
			},
			{
				label: "Rate-shopping latency",
				value: "< 400ms per shipment",
				highlight: true,
			},
			{
				label: "Shipping rules per account",
				value: "Unlimited",
				highlight: true,
			},
			{ label: "Label formats", value: "ZPL, PNG, PDF (4x6, 8.5x11)" },
			{
				label: "End-of-day manifest",
				value: "Auto-generated, carrier-formatted",
			},
			{
				label: "Returns label generation",
				value: "In-box pre-print or on-demand",
			},
		],
		mockup: <ShippingMockup />,
	},
	{
		step: "06",
		category: "ANALYTICS",
		subtitle: "REAL-TIME REPORTING & API",
		title: "Numbers that move ",
		titleHighlight: "as fast as your floor.",
		description:
			"Every metric refreshes in under 5 seconds. Cost per order, cycle time, SLA compliance — drag-and-drop your own report without touching SQL. The API responds in 120ms at p95. Webhooks fire on 34 event types. Your BI tool connects in an afternoon.",
		specs: [
			{
				label: "API response time (p95)",
				value: "< 120ms",
				highlight: true,
			},
			{
				label: "Data freshness",
				value: "Real-time (≤ 5s lag)",
				highlight: true,
			},
			{ label: "Historical data retention", value: "7 years" },
			{ label: "Custom report builder", value: "Drag-and-drop, no SQL" },
			{ label: "Webhook events", value: "34 event types" },
			{ label: "Export formats", value: "CSV, JSON, Parquet, PDF" },
		],
		mockup: <AnalyticsMockup />,
	},
];

function InboundMockup() {
	return (
		<Card className="w-full bg-card/80 backdrop-blur-sm border-muted shadow-xl overflow-hidden rounded-2xl">
			<CardHeader className="border-b border-border/50 bg-muted/20 py-4 flex flex-row items-center justify-between space-y-0">
				<div className="flex items-center gap-2">
					<Truck className="h-4 w-4 text-primary" />
					<CardTitle className="text-sm font-medium">
						Dock Scheduling Board
					</CardTitle>
				</div>
				<Badge
					variant="outline"
					className="text-primary border-primary/20 bg-primary/10"
				>
					4 docks monitored
				</Badge>
			</CardHeader>
			<CardContent className="p-0">
				<div className="flex flex-col">
					{[
						{
							dock: "1",
							trk: "TRK-4421",
							status: "RECEIVING",
							progress: 68,
							scanned: 240,
						},
						{
							dock: "2",
							trk: "TRK-4418",
							status: "STAGED",
							progress: 100,
							scanned: 180,
						},
						{
							dock: "3",
							trk: "-",
							status: "EMPTY",
							progress: 0,
							scanned: 0,
						},
						{
							dock: "4",
							trk: "TRK-4422",
							status: "RECEIVING",
							progress: 31,
							scanned: 95,
						},
					].map((item, i) => (
						<div
							key={i}
							className="p-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
						>
							<div className="flex justify-between items-center mb-3">
								<div className="flex items-center gap-2">
									<span className="font-bold text-sm">
										Dock {item.dock}
									</span>
									<span className="text-xs text-muted-foreground font-mono">
										{item.trk}
									</span>
								</div>
								<Badge
									variant={
										item.status === "EMPTY"
											? "outline"
											: "secondary"
									}
									className={
										item.status === "RECEIVING"
											? "bg-primary/20 text-primary border-primary/20"
											: ""
									}
								>
									{item.status}
								</Badge>
							</div>
							<div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
								<div
									className="h-full bg-primary rounded-full transition-all duration-1000"
									style={{ width: `${item.progress}%` }}
								/>
							</div>
							<div className="flex justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
								<span>{item.scanned} items scanned</span>
								<span>{item.progress}%</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function StorageMockup() {
	return (
		<Card className="w-full bg-card/80 backdrop-blur-sm border-muted shadow-xl overflow-hidden rounded-2xl">
			<CardHeader className="border-b border-border/50 bg-muted/20 py-4 flex flex-row items-center justify-between space-y-0">
				<div className="flex items-center gap-2">
					<Box className="h-4 w-4 text-primary" />
					<CardTitle className="text-sm font-medium">
						Bin Location Map — Aisle A-D
					</CardTitle>
				</div>
				<span className="text-xs font-mono text-muted-foreground">
					91% utilized
				</span>
			</CardHeader>
			<CardContent className="p-6">
				<div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<div className="w-3 h-3 rounded bg-primary" /> Full
					</div>
					<div className="flex items-center gap-1.5">
						<div className="w-3 h-3 rounded bg-primary/40" />{" "}
						Partial
					</div>
					<div className="flex items-center gap-1.5">
						<div className="w-3 h-3 rounded bg-muted" /> Empty
					</div>
				</div>

				<div className="grid grid-cols-5 gap-2 mb-6">
					{["A", "B", "C", "D"].map((row) =>
						[1, 2, 3, 4, 5].map((col) => {
							const id = `${row}-0${col}`;
							// Randomize state based on id
							const isFull = [
								"A-01",
								"A-02",
								"A-03",
								"A-04",
								"B-03",
								"C-01",
								"C-03",
								"C-04",
								"C-05",
								"D-03",
								"D-04",
								"D-05",
							].includes(id);
							const isPartial = [
								"B-01",
								"B-02",
								"B-05",
								"D-02",
							].includes(id);

							return (
								<div
									key={id}
									className={`
										h-10 rounded-md border border-border/50 flex items-center px-2 text-xs font-mono
										${isFull ? "bg-primary text-primary-foreground border-primary" : ""}
										${isPartial ? "bg-primary/20 text-primary border-primary/30" : ""}
										${!isFull && !isPartial ? "bg-muted/30 text-muted-foreground" : ""}
									`}
								>
									{id}
								</div>
							);
						}),
					)}
				</div>

				<div className="rounded-lg bg-muted/40 border border-border/50 p-4">
					<div className="text-xs font-medium text-primary mb-1">
						Active Slotting Rule
					</div>
					<div className="text-xs font-mono text-muted-foreground">
						IF velocity &gt; 200/day &rarr; assign to zone A-B
						(golden zone)
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function PickingMockup() {
	return (
		<Card className="w-full bg-card/80 backdrop-blur-sm border-muted shadow-xl overflow-hidden rounded-2xl">
			<CardHeader className="border-b border-border/50 bg-muted/20 py-4 flex flex-row items-center justify-between space-y-0">
				<div className="flex items-center gap-2">
					<MapPin className="h-4 w-4 text-primary" />
					<CardTitle className="text-sm font-medium">
						Optimized Pick Wave — Wave #4491
					</CardTitle>
				</div>
				<span className="text-xs font-mono text-primary">
					99.7% accuracy
				</span>
			</CardHeader>
			<CardContent className="p-6">
				<div className="mb-6">
					<div className="text-xs font-medium mb-3">
						Pick Path (Optimized)
					</div>
					<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
						<Badge className="bg-primary/20 text-primary hover:bg-primary/30">
							Start
						</Badge>
						<ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
						<Badge
							variant="outline"
							className="bg-muted/50 font-mono"
						>
							A-14
						</Badge>
						<ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
						<Badge
							variant="outline"
							className="bg-muted/50 font-mono"
						>
							C-22
						</Badge>
						<ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
						<Badge
							variant="outline"
							className="bg-muted/50 font-mono"
						>
							B-07
						</Badge>
						<ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
						<Badge className="bg-primary/20 text-primary hover:bg-primary/30">
							Pack
						</Badge>
					</div>
					<div className="text-[10px] font-mono text-primary mt-2 flex items-center gap-1">
						<span>↓ 340m saved vs. unoptimized path</span>
					</div>
				</div>

				<div className="space-y-3">
					{[
						{
							name: "Wireless Headset Pro",
							sku: "SKU-A103",
							bin: "Bin A-14-3",
							qty: 2,
							priority: "HIGH",
						},
						{
							name: "USB-C Hub 7-Port",
							sku: "SKU-C847",
							bin: "Bin C-22-1",
							qty: 5,
							priority: "NORMAL",
						},
						{
							name: "Laptop Stand Aluminum",
							sku: "SKU-B391",
							bin: "Bin B-07-2",
							qty: 1,
							priority: "RUSH",
						},
					].map((item, i) => (
						<div
							key={i}
							className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20"
						>
							<div>
								<div className="font-medium text-sm mb-1">
									{item.name}
								</div>
								<div className="text-xs font-mono text-muted-foreground">
									{item.sku} &bull; {item.bin}
								</div>
							</div>
							<div className="flex items-center gap-3">
								<span className="font-mono text-sm">
									&times;{item.qty}
								</span>
								<Badge
									variant="outline"
									className={`text-[10px] uppercase ${
										item.priority === "HIGH"
											? "text-amber-500 border-amber-500/30"
											: item.priority === "RUSH"
												? "text-red-500 border-red-500/30"
												: "text-muted-foreground"
									}`}
								>
									{item.priority}
								</Badge>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function PackingMockup() {
	return (
		<Card className="w-full bg-card/80 backdrop-blur-sm border-muted shadow-xl overflow-hidden rounded-2xl">
			<CardHeader className="border-b border-border/50 bg-muted/20 py-4 flex flex-row items-center justify-between space-y-0">
				<div className="flex items-center gap-2">
					<Box className="h-4 w-4 text-primary" />
					<CardTitle className="text-sm font-medium">
						Pack Station — PS-04
					</CardTitle>
				</div>
				<span className="text-xs font-mono text-muted-foreground">
					Order ORD-48291
				</span>
			</CardHeader>
			<CardContent className="p-6">
				<div className="mb-6">
					<div className="text-xs font-medium mb-3 text-muted-foreground">
						Items in tote
					</div>
					<div className="space-y-3">
						{[
							{
								name: "Wireless Headset Pro",
								sku: "SKU-A103 ×2",
								status: "done",
							},
							{
								name: "Charging Cable USB-C",
								sku: "SKU-G512 ×1",
								status: "done",
							},
							{
								name: "Laptop Stand",
								sku: "SKU-B391 ×1",
								status: "warn",
							},
						].map((item, i) => (
							<div
								key={i}
								className="flex items-center justify-between"
							>
								<div>
									<div className="text-sm">{item.name}</div>
									<div className="text-xs font-mono text-muted-foreground">
										{item.sku}
									</div>
								</div>
								{item.status === "done" ? (
									<div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
										<CheckCircle2 className="h-3 w-3 text-primary" />
									</div>
								) : (
									<div className="h-5 w-5 rounded-full border border-amber-500/50 flex items-center justify-center text-amber-500 text-[10px] font-bold">
										!
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border border-border/50 bg-muted/20 p-4 mb-4">
					<div className="text-xs font-medium text-primary mb-1">
						Cartonization Rule Applied
					</div>
					<div className="text-xs font-mono text-muted-foreground">
						2.1kg &bull; 34×28×18cm &rarr; Box B (Medium) &bull; No
						void fill needed
					</div>
				</div>

				<div className="rounded-lg border border-border/50 bg-muted/20 p-4">
					<div className="text-xs font-medium mb-2">
						Active Packing Rules
					</div>
					<ul className="space-y-2 text-xs font-mono text-muted-foreground">
						<li className="flex items-start gap-2">
							<span className="text-primary mt-0.5">&bull;</span>{" "}
							IF fragile_tag &rarr; add bubble wrap layer
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-0.5">&bull;</span>{" "}
							IF value &gt; $200 &rarr; require double-scan
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-0.5">&bull;</span>{" "}
							IF destination = CA &rarr; use recycled box
						</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}

function ShippingMockup() {
	return (
		<Card className="w-full bg-card/80 backdrop-blur-sm border-muted shadow-xl overflow-hidden rounded-2xl">
			<CardHeader className="border-b border-border/50 bg-muted/20 py-4 flex flex-row items-center justify-between space-y-0">
				<div className="flex items-center gap-2">
					<Truck className="h-4 w-4 text-primary" />
					<CardTitle className="text-sm font-medium">
						Carrier Rate Shopping
					</CardTitle>
				</div>
				<span className="text-xs font-mono text-primary">
					Auto-selecting cheapest
				</span>
			</CardHeader>
			<CardContent className="p-6">
				<div className="grid grid-cols-3 gap-4 text-center mb-6 border-b border-border/50 pb-6">
					<div>
						<div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">
							Weight
						</div>
						<div className="font-mono font-medium">2.1 kg</div>
					</div>
					<div>
						<div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">
							Destination
						</div>
						<div className="font-mono font-medium">Austin, TX</div>
					</div>
					<div>
						<div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">
							Service
						</div>
						<div className="font-mono font-medium">Ground</div>
					</div>
				</div>

				<div className="space-y-3">
					{[
						{
							carrier: "UPS",
							days: "2 days",
							price: "$6.42",
							selected: false,
						},
						{
							carrier: "FedEx",
							days: "2 days",
							price: "$7.18",
							selected: false,
						},
						{
							carrier: "USPS",
							days: "5 days",
							price: "$3.91",
							selected: true,
						},
						{
							carrier: "DHL",
							days: "1 day",
							price: "$11.20",
							selected: false,
						},
					].map((item, i) => (
						<div
							key={i}
							className={`flex items-center justify-between p-3 rounded-lg border ${item.selected ? "border-primary bg-primary/5" : "border-border/50 bg-muted/20"}`}
						>
							<div className="flex items-center gap-3">
								{item.selected ? (
									<div className="w-2 h-2 rounded-full bg-primary" />
								) : (
									<div className="w-2 h-2 rounded-full bg-transparent" />
								)}
								<div>
									<div className="font-bold text-sm">
										{item.carrier}
									</div>
									<div className="text-[10px] text-muted-foreground uppercase">
										{item.days}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<span className="font-mono font-bold text-sm">
									{item.price}
								</span>
								{item.selected && (
									<Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/20">
										SELECTED
									</Badge>
								)}
							</div>
						</div>
					))}
				</div>

				<div className="mt-4 p-3 rounded-lg border border-border/50 bg-muted/10 text-xs font-mono text-muted-foreground flex flex-col gap-1">
					<span className="text-primary font-bold">Rule Fired</span>
					<span>
						IF weight &lt; 1lb AND zone &le; 4 &rarr; force USPS
						Priority
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

function AnalyticsMockup() {
	return (
		<Card className="w-full bg-card/80 backdrop-blur-sm border-muted shadow-xl overflow-hidden rounded-2xl">
			<CardHeader className="border-b border-border/50 bg-muted/20 py-4 flex flex-row items-center justify-between space-y-0">
				<div className="flex items-center gap-2">
					<Activity className="h-4 w-4 text-primary" />
					<CardTitle className="text-sm font-medium">
						Order Velocity — Today
					</CardTitle>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
					<span className="text-xs font-mono text-primary">Live</span>
				</div>
			</CardHeader>
			<CardContent className="p-6">
				{/* Chart Placeholder */}
				<div className="h-32 w-full border-b border-border/50 flex items-end justify-between pb-2 mb-2 relative">
					<div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-50" />
					{/* Fake chart lines */}
					<svg
						className="absolute inset-0 h-full w-full"
						preserveAspectRatio="none"
						viewBox="0 0 100 100"
					>
						<path
							d="M0,80 C20,70 30,90 50,40 C70,20 80,60 100,10"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="text-primary"
						/>
					</svg>
					{[
						"8am",
						"9am",
						"10am",
						"11am",
						"12pm",
						"1pm",
						"2pm",
						"3pm",
					].map((time, i) => (
						<div
							key={i}
							className="text-[10px] text-muted-foreground z-10"
						>
							{time}
						</div>
					))}
				</div>

				<div className="grid grid-cols-2 gap-4 mt-6">
					{[
						{
							label: "Avg. Order Cycle Time",
							value: "4.2 min",
							trend: "-18s",
							positive: true,
						},
						{
							label: "Cost per Order",
							value: "$1.84",
							trend: "-$0.12",
							positive: true,
						},
						{
							label: "Return Rate",
							value: "1.2%",
							trend: "+0.1%",
							positive: false,
						},
						{
							label: "SLA Compliance",
							value: "99.1%",
							trend: "+0.4%",
							positive: true,
						},
					].map((stat, i) => (
						<div
							key={i}
							className="p-4 rounded-xl border border-border/50 bg-muted/20"
						>
							<div className="text-xs text-muted-foreground mb-1">
								{stat.label}
							</div>
							<div className="flex items-baseline gap-2">
								<span className="text-2xl font-bold">
									{stat.value}
								</span>
								<span
									className={`text-[10px] font-bold ${stat.positive ? "text-primary" : "text-amber-500"}`}
								>
									{stat.trend}
								</span>
							</div>
						</div>
					))}
				</div>

				<div className="mt-4 p-3 rounded-lg border border-border/50 bg-muted/10 flex items-center justify-between">
					<div className="flex flex-col gap-1">
						<span className="text-[10px] font-bold text-primary uppercase tracking-wider">
							API Response
						</span>
						<span className="text-xs font-mono text-muted-foreground">
							GET /v2/analytics/orders &rarr; 200 OK &bull;{" "}
							<span className="text-primary">87ms</span>
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<main className="flex min-h-screen flex-col items-center overflow-hidden pt-24 pb-12">
			<div className="container px-4 md:px-6">
				{/* Top Badge */}
				<div className="flex flex-col md:flex-row items-center gap-4 mb-8">
					<div className="inline-flex items-center gap-2 rounded-full border bg-background p-1 pr-4 text-sm text-muted-foreground shadow-sm">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
							<Shield className="h-3 w-3" />
						</div>
						<span className="font-medium text-foreground">
							Secure &bull; Scalable &bull; Real-Time
						</span>
					</div>
					<div className="hidden md:block h-px w-8 bg-border" />
					<p className="text-sm text-muted-foreground text-center md:text-left">
						A single WMS to standardize operations across every
						site.
					</p>
				</div>

				<div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-start">
					<div className="flex flex-col justify-center space-y-8">
						<div className="space-y-2">
							<h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-none uppercase">
								Warehouse
							</h1>
							<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
								Management Systems
							</h2>
						</div>

						<p className="max-w-[600px] text-lg text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
							Our entry-to-enterprise WMS orchestrates people,
							processes, robotics, and automation in one scalable
							system.
						</p>

						<div className="flex flex-col sm:flex-row gap-4">
							<Button
								size="lg"
								className="rounded-full px-8 h-12 text-sm font-bold tracking-wide"
							>
								TALK TO AN EXPERT
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="rounded-full px-8 h-12 text-sm font-bold tracking-wide"
							>
								KEY RESOURCES
							</Button>
						</div>

						<div className="pt-12">
							<h3 className="text-xl font-bold mb-6">
								Turn Expertise Into Measurable Impact
							</h3>
							<div className="grid sm:grid-cols-2 gap-4">
								<Card className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border-muted">
									<div className="flex items-baseline justify-between mb-4">
										<span className="text-4xl md:text-5xl font-bold text-primary">
											1,600+
										</span>
										<span className="text-xs font-bold text-muted-foreground tracking-wider uppercase ml-2 text-right">
											WMS Customers
										</span>
									</div>
									<div className="h-px w-full bg-border/50 mb-4" />
									<p className="text-sm text-muted-foreground">
										Trusted across the Americas, Europe and
										Asia.
									</p>
								</Card>
								<Card className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border-muted">
									<div className="flex items-baseline justify-between mb-4">
										<span className="text-4xl md:text-5xl font-bold text-primary">
											40+
										</span>
										<span className="text-xs font-bold text-muted-foreground tracking-wider uppercase ml-2 text-right">
											WWMS Expertise
										</span>
									</div>
									<div className="h-px w-full bg-border/50 mb-4" />
									<p className="text-sm text-muted-foreground">
										Continuous innovation through upgrades
										and support.
									</p>
								</Card>
							</div>
						</div>
					</div>

					{/* Placeholder for the isometric graphic */}
					<div className="relative h-full min-h-[400px] lg:min-h-[600px] hidden lg:flex items-center justify-center">
						<div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-primary/10 to-transparent rounded-full blur-3xl" />
						{/* Abstract representation of the blocks */}
						<div className="relative w-full max-w-md aspect-square">
							<div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/80 backdrop-blur-md rounded-2xl rotate-12 shadow-2xl animate-pulse" />
							<div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-card border shadow-xl rounded-2xl -rotate-6" />
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-background border shadow-2xl rounded-2xl" />
						</div>
					</div>
				</div>

				{/* Feature Sections */}
				<div className="mt-32 flex flex-col gap-32 pb-32">
					{features.map((feature, index) => {
						const isEven = index % 2 === 1;
						return (
							<div
								key={feature.step}
								className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-24 ${isEven ? "lg:flex-row-reverse" : ""}`}
							>
								{/* Text Content */}
								<div className="flex-1 space-y-6">
									<div className="flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-primary uppercase mb-8">
										<span>{feature.step}</span>
										<div className="h-px w-8 bg-primary/50" />
										<span>{feature.category}</span>
									</div>

									<div className="space-y-4">
										<p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
											{feature.subtitle}
										</p>
										<h2 className="text-4xl md:text-5xl font-bold tracking-tight">
											{feature.title}
											<span className="italic text-primary">
												{feature.titleHighlight}
											</span>
										</h2>
									</div>

									<p className="text-lg text-muted-foreground leading-relaxed">
										{feature.description}
									</p>

									<Card className="mt-8 bg-muted/20 border-border/50">
										<CardHeader className="py-4 border-b border-border/50">
											<CardTitle className="text-xs tracking-wider uppercase text-muted-foreground font-bold">
												Technical Specifications
											</CardTitle>
										</CardHeader>
										<CardContent className="p-0">
											<div className="divide-y divide-border/50">
												{feature.specs.map(
													(spec, i) => (
														<div
															key={i}
															className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2"
														>
															<span className="text-sm text-muted-foreground">
																{spec.label}
															</span>
															<span
																className={`text-sm font-mono text-right ${spec.highlight ? "text-primary font-bold" : "text-foreground"}`}
															>
																{spec.value}
															</span>
														</div>
													),
												)}
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Mockup Area */}
								<div className="flex-1 w-full relative">
									<div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
									<div className="relative z-10 w-full max-w-xl mx-auto">
										{feature.mockup}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</main>
	);
}
