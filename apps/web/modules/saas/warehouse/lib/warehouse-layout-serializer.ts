// Utility to convert between Warehouse (designer) and Location[] (backend)
import type { Warehouse, WarehouseFloor, Zone, StorageUnit, Asset } from "./warehouse-types";

// Flattens a Warehouse object into an array of Location create inputs
export function warehouseToLocationInputs(warehouse: Warehouse) {
  const locations: any[] = [];
  // Floors
  for (const floor of warehouse.floors) {
    locations.push({
      type: "FLOOR",
      code: floor.code,
      name: floor.name,
      x: floor.originXMm,
      y: floor.originYMm,
      z: floor.elevationMm,
      width: floor.widthMm,
      depth: floor.lengthMm,
      height: floor.heightMm,
      meshType: "FLOOR",
      sequence: floor.floorNumber,
    });
  }
  // Zones
  for (const zone of warehouse.zones) {
    locations.push({
      type: "ZONE",
      code: zone.code,
      name: zone.name,
      colorHex: zone.colorHex,
      meshType: zone.type,
    });
  }
  // StorageUnits
  for (const floor of warehouse.floors) {
    for (const su of floor.storageUnits) {
      locations.push({
        type: su.type,
        code: su.code,
        name: su.name,
        x: su.startXMm,
        y: su.startYMm,
        z: su.startZMm,
        width: su.widthMm,
        depth: su.lengthMm,
        height: su.heightMm,
        rotationX: su.rotationXDeg,
        rotationY: su.rotationYDeg,
        rotationZ: su.rotationZDeg,
        colorHex: su.colorHex,
        meshType: su.type,
      });
    }
  }
  // Assets
  for (const floor of warehouse.floors) {
    for (const asset of floor.assets) {
      locations.push({
        type: asset.type,
        code: asset.code,
        name: asset.name,
        x: asset.startXMm,
        y: asset.startYMm,
        z: asset.startZMm,
        width: asset.widthMm,
        depth: asset.lengthMm,
        height: asset.heightMm,
        rotationX: asset.rotationXDeg,
        rotationY: asset.rotationYDeg,
        rotationZ: asset.rotationZDeg,
        colorHex: asset.colorHex,
        meshType: asset.type,
      });
    }
  }
  return locations;
}

// Rebuilds a Warehouse object from a flat array of Locations
export function locationsToWarehouse(locations: any[], meta: { name: string; code: string; timezone: string }) {
  // TODO: Implement full deserialization logic
  // For now, just return a stub Warehouse with floors, zones, storageUnits, assets empty
  return {
    id: "",
    code: meta.code,
    name: meta.name,
    timezone: meta.timezone,
    status: "ACTIVE",
    activeFloorId: "",
    floors: [],
    zones: [],
    handlingUnits: [],
    updatedAt: Date.now(),
  };
}
