import { db as prisma } from "../prisma";
import type { Warehouse } from "@repo/types";

/**
 * Save the full warehouse layout by deleting all existing locations for the warehouse
 * and recreating them from the provided Warehouse layout object.
 * Returns the created locations.
 */
export async function saveWarehouseLayout(input: {
  organizationId: string;
  warehouseId: string;
  locations: any[]; // Flat array of location create inputs (already mapped)
}) {
  const { organizationId, warehouseId, locations } = input;

  // Delete all existing locations for this warehouse
  await prisma.location.deleteMany({
    where: { warehouseId },
  });

  // Create all locations in order (parent before children)
  const created: any[] = [];
  for (const loc of locations) {
    const createdLoc = await prisma.location.create({ data: { ...loc, warehouseId } });
    created.push(createdLoc);
  }
  return created;
}

/**
 * Load all locations for a warehouse, sorted parent-first.
 */
export async function loadWarehouseLayout(input: {
  organizationId: string;
  warehouseId: string;
}) {
  const { warehouseId } = input;
  const locations = await prisma.location.findMany({
    where: { warehouseId },
    orderBy: [
      { parentLocationId: "asc" },
      { sequence: "asc" },
      { code: "asc" },
    ],
  });
  return locations;
}
