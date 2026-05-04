# MOB-015: Inter-Warehouse Transfer Receive - Component Specification

## Screen Reference
- **ID**: MOB-015 | **Name**: Inter-Warehouse Transfer Receive
- **Base Spec**: `../../mobile-screen-specs/MOB-015 Inter-Warehouse Transfer Receive.md`
- **Deep Link**: `venti://transfer/receive/:transferId`

## Component Inventory
**Primary**: 1. Transfer Manifest, 2. In-Transit vs Received Panel, 3. Quantity Input, 4. Confirm Receipt Button
**Secondary**: 5. Damage Toggle, 6. Missing Items Flag, 7. Discrepancy Case Button
**Modals**: Discrepancy Form, Damage Documentation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| inTransitQty | number | From manifest |
| receivedQty | number | Confirmed qty |
| damagedQty | number | Optional |
| missingItems | array | SKU + qty |

## Layout
**Header**: Transfer order + source warehouse
**Comparison**: Side-by-side in-transit vs received
**Line Cards**: 120px each with qty input
**Footer**: Discrepancy button + Confirm button

## Key Components
- **Manifest Header**: TO ID + source warehouse + expected arrival date
- **Comparison Panel**: Shows planned vs received with variance highlight
- **Line Scan**: Scan manifest barcode, then line-level SKU scanning
- **Qty Input**: Large stepper, defaults to in-transit qty
- **Damage Toggle**: Per-line damage flag with photo capture
- **Missing Flag**: Mark items as not received, auto-creates discrepancy case
- **Discrepancy Button**: Opens form to document variance reasons, generates case ID

## Mobile-Specific
- **Scanner-first**: Yes, manifest then line items
- **Gloves-friendly**: Yes, large inputs
- **Offline**: Yes, queued receipt with sync
- **Immediate Case Creation**: Discrepancy generates case ID on device
