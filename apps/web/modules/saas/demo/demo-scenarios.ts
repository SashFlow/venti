export type DemoScenario = {
	id: string;
	title: string;
	description: string;
	steps: Array<{
		delayMs: number;
		message: string;
		href?: string;
	}>;
};

export const DEMO_SCENARIOS: DemoScenario[] = [
	{
		id: "control-tower",
		title: "1. Control Tower insight",
		description: "Approve AI replenishment from dashboard",
		steps: [
			{ delayMs: 0, message: "Opening home dashboard…", href: "/app/home" },
			{
				delayMs: 4000,
				message: "Navigate to Analytics for demand insight",
				href: "/app/analytics",
			},
			{
				delayMs: 8000,
				message: "Approve replenishment on insight card",
			},
			{
				delayMs: 12000,
				message: "Show Autopilot queue",
				href: "/app/autopilot",
			},
		],
	},
	{
		id: "agv-twin",
		title: "2. 3D twin + AGV",
		description: "Operations heatmap and AGV dispatch",
		steps: [
			{
				delayMs: 0,
				message: "Open warehouse layout in 3D",
				href: "/app/warehouse",
			},
			{
				delayMs: 5000,
				message: "Toggle Operations view and dispatch AGV-01",
			},
		],
	},
	{
		id: "wave-pick",
		title: "3. Wave release + operator pick",
		description: "Route optimization and PWA pick confirm",
		steps: [
			{
				delayMs: 0,
				message: "Open fulfillment waves",
				href: "/app/orders?tab=fulfill",
			},
			{
				delayMs: 5000,
				message: "Release a wave and open operator PWA",
				href: "/operator",
			},
		],
	},
	{
		id: "receive",
		title: "4. PWA receive",
		description: "Receive PO with putaway suggestion",
		steps: [
			{ delayMs: 0, message: "Open operator receive", href: "/operator" },
			{
				delayMs: 4000,
				message: "Select open PO and confirm receive qty",
			},
		],
	},
	{
		id: "returns",
		title: "5. Returns RESTOCK",
		description: "Returns wizard through disposition",
		steps: [
			{ delayMs: 0, message: "Open returns wizard", href: "/app/returns" },
			{
				delayMs: 4000,
				message: "Load demo return → inspect → RESTOCK",
			},
		],
	},
];
