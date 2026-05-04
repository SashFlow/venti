# MOB-014: Inter-Warehouse Transfer Pick - Component Specification

## Screen Reference
- **ID**: MOB-014 | **Name**: Inter-Warehouse Transfer Pick
- **Base Spec**: `../../mobile-screen-specs/MOB-014 Inter-Warehouse Transfer Pick.md`
- **Deep Link**: `venti://transfer/pick/:transferId`

## Component Inventory
**Primary**: 1. Transfer Order Header, 2. Line List, 3. Pick Confirmation, 4. Partial Toggle
**Secondary**: 5. Source/Destination Context, 6. Stage Location, 7. Finalize Button
**Modals**: Partial Transfer Confirmation, Stage Location Picker

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| transferOrderId | string | TO-#### |
| destinationWarehouse | string | Warehouse code |
| requiredQty | number | Per line |
| stagedQty | number | Confirmed qty |
| allowPartial | boolean | Policy setting |

## Layout
**Header**: TO ID + destination warehouse
**Line Cards**: 100px each, scrollable list
**Footer**: Partial toggle + Finalize button

## Key Components
- **Transfer Header**: TO ID + destination warehouse name + total lines
- **Line Card**: SKU + required qty + staged qty + pick button
- **Pick Flow**: Similar to MOB-009 (bin scan → SKU scan → qty)
- **Partial Toggle**: Allow partial dispatch if shortage
- **Stage Location**: Shows staging area for picked items
- **Finalize Button**: Completes transfer pick, generates shipping manifest

## Mobile-Specific
- **Scanner-first**: Yes, per-line pick validation
- **Gloves-friendly**: Yes, card height 100px
- **Offline**: Yes, queued transfer completion
- **Partial Handling**: Clear indication of partial vs full transfer
