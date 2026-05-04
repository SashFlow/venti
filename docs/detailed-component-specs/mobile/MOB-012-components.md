# MOB-012: Dispatch Scan Confirmation - Component Specification

## Screen Reference
- **ID**: MOB-012 | **Name**: Dispatch Scan Confirmation
- **Base Spec**: `../../mobile-screen-specs/MOB-012 Dispatch Scan Confirmation.md`
- **Deep Link**: `venti://dispatch/scan/:manifestId`

## Component Inventory
**Primary**: 1. Vehicle Manifest Header, 2. Scan List, 3. Loaded vs Planned Panel, 4. Complete Dispatch Button
**Secondary**: 5. Sequence Reorder, 6. Remove Mis-scan, 7. Progress Bar
**Modals**: Duplicate Scan Warning, Sequence Conflict

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| shipmentId | string | Scanned shipment |
| loadSequence | number | Order in vehicle |
| plannedCount | number | Expected shipments |
| loadedCount | number | Actually scanned |

## Layout
**Header**: Manifest ID + progress (X of Y)
**Scan Area**: Middle, sequential scan input
**List**: Bottom half, scanned items with sequence

## Key Components
- **Manifest Header**: Vehicle ID + driver + route + planned shipments count
- **Scan Input**: Large barcode scan area, auto-advances on valid scan
- **Loaded List**: Real-time list of scanned shipments with sequence numbers
- **Progress**: "12 of 15 loaded" with visual bar
- **Sequence Reorder**: Drag handles to adjust load order if needed
- **Mis-scan Removal**: Swipe left to remove incorrect scan
- **Deduplication**: Prevents scanning same shipment twice, shows warning

## Mobile-Specific
- **Scanner-first**: Yes, sequential rapid scanning
- **Gloves-friendly**: Yes, large scan area
- **Offline**: Partial (can scan, queues completion)
- **Sound**: Distinct beep per successful scan, completion melody
- **Vibration**: Error vibration on duplicate/invalid
