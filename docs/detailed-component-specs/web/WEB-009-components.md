# WEB-009: Dispatch Console - Component Specification

## Screen Reference
- **ID**: WEB-009 | **Name**: Dispatch Console
- **Base Spec**: `../../web-screen-specs/WEB-009 Dispatch Console.md`
- **Route**: `/workspace/:workspaceId/dispatch/console`

## Component Inventory
**Primary**: 1. Shipment List Table, 2. Vehicle Selector, 3. Load Sequence Planner, 4. Complete Dispatch Button
**Secondary**: 5. Capacity Gauge, 6. Driver Assignment, 7. Dispatch Delay Tracker
**Modals**: Allocate to Vehicle Modal, Sequence Editor, Dispatch Confirmation

## Data Schema
| Field | Type |
|-------|------|
| shipmentId | string |
| vehicleId | string |
| loadSequence | number |
| capacity | object |
| driver | string |

## Layout
**Pattern**: Table left (60%) + vehicle panel right (40%)
**Table**: Shipments ready to dispatch
**Panel**: Vehicle capacity and load sequence

## Key Components
- **Shipment Table**: Shipment ID, Destination, Weight, Volume, Status, Allocate button
- **Vehicle Panel**: Vehicle ID + capacity gauge (weight/volume) + driver assignment + load sequence list
- **Capacity Gauge**: Visual progress bar showing used vs total capacity
- **Load Sequence**: Drag-droppable list of shipments in load order
- **Driver Dropdown**: Assign driver to vehicle
- **Dispatch Delay**: Shows shipments delayed beyond cutoff
- **Allocate Button**: Add shipment to vehicle
- **Complete Dispatch**: Finalizes dispatch, triggers vehicle departure

## Web-Specific
- **Drag-Drop Sequencing**: Reorder load sequence
- **Capacity Visualization**: Real-time capacity calculation
- **Bulk Allocation**: Multi-select shipments for vehicle
