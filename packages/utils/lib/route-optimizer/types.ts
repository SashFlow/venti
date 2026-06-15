export type Point3D = {
	x: number;
	y: number;
	z: number;
};

export type RouteStop = {
	lineId: string;
	locationId: string;
	locationCode: string;
	skuCode: string;
	zoneCode: string;
	salesOrderId?: string;
	point: Point3D;
};

export type PickerRouteStop = {
	lineId: string;
	locationId: string;
	locationCode: string;
	skuCode: string;
	sequence: number;
	x: number;
	y: number;
	z: number;
};

export type PickerRoute = {
	label: string;
	cartId: string;
	zoneCode: string;
	distanceM: number;
	lineCount: number;
	color: string;
	stops: PickerRouteStop[];
};

export type WaveRoutePlan = {
	pickerCount: number;
	naiveDistanceM: number;
	optimizedDistanceM: number;
	savingsPercent: number;
	pickers: PickerRoute[];
	warnings?: string[];
};

export type WaveType =
	| "SINGLE_ORDER"
	| "BATCH"
	| "ZONE"
	| "CLUSTER";

export type OptimizeRoutesOptions = {
	pickerCount: number;
	waveType: WaveType;
	entryPoint?: Point3D;
};

export const PICKER_COLORS = [
	"#3b82f6",
	"#22c55e",
	"#f59e0b",
	"#a855f7",
	"#ef4444",
	"#06b6d4",
];
