import { z } from "zod";

export const layoutLocationInputSchema = z.object({
	code: z.string().min(1),
	name: z.string().nullable().optional(),
	type: z.string().min(1),
	barcode: z.string().nullable().optional(),
	sequence: z.number().int().nullable().optional(),
	x: z.union([z.number(), z.string()]).nullable().optional(),
	y: z.union([z.number(), z.string()]).nullable().optional(),
	z: z.union([z.number(), z.string()]).nullable().optional(),
	width: z.union([z.number(), z.string()]).nullable().optional(),
	height: z.union([z.number(), z.string()]).nullable().optional(),
	depth: z.union([z.number(), z.string()]).nullable().optional(),
	rotationX: z.union([z.number(), z.string()]).nullable().optional(),
	rotationY: z.union([z.number(), z.string()]).nullable().optional(),
	rotationZ: z.union([z.number(), z.string()]).nullable().optional(),
	meshType: z.string().nullable().optional(),
	colorHex: z.string().nullable().optional(),
	parentCode: z.string().nullable().optional(),
});

export const layoutAssetInputSchema = z.object({
	name: z.string().nullable().optional(),
	type: z.string().min(1),
	x: z.union([z.number(), z.string()]).nullable().optional(),
	y: z.union([z.number(), z.string()]).nullable().optional(),
	z: z.union([z.number(), z.string()]).nullable().optional(),
	width: z.union([z.number(), z.string()]).nullable().optional(),
	height: z.union([z.number(), z.string()]).nullable().optional(),
	depth: z.union([z.number(), z.string()]).nullable().optional(),
	rotationX: z.union([z.number(), z.string()]).nullable().optional(),
	rotationY: z.union([z.number(), z.string()]).nullable().optional(),
	rotationZ: z.union([z.number(), z.string()]).nullable().optional(),
	meshType: z.string().nullable().optional(),
	colorHex: z.string().nullable().optional(),
	anchorLocationCode: z.string().nullable().optional(),
});

export const layoutSceneSchema = z.object({
	locations: z.array(layoutLocationInputSchema),
	assets: z.array(layoutAssetInputSchema).default([]),
	meta: z.record(z.unknown()).optional(),
});

