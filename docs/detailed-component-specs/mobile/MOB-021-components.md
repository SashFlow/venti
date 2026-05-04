# MOB-021: Technician Stock Consume - Component Specification

## Screen Reference
- **ID**: MOB-021 | **Name**: Technician Stock Consume
- **Base Spec**: `../../mobile-screen-specs/MOB-021 Technician Stock Consume.md`
- **Deep Link**: `venti://tech/consume`

## Component Inventory
**Primary**: 1. Part ID Input, 2. Service Ticket Input, 3. Consumed Qty Input, 4. Confirm Consume Button
**Secondary**: 5. Stock Level Panel, 6. Ticket Context, 7. Replenishment Request Button
**Modals**: Low Stock Warning, Ticket Lookup Drawer

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| partId | string | Scanned part barcode |
| serviceTicket | string | Ticket ID |
| consumedQty | number | > 0 |
| stockLevel | number | Current stock |
| reorderPoint | number | Threshold |

## Layout
**Header**: Stock consume title
**Scan Areas**: Part scan + ticket scan (sequential)
**Qty Input**: Large stepper
**Stock Display**: Card showing current levels
**Footer**: Confirm button

## Key Components
- **Part Scanner**: Scan part barcode, loads part details and stock level
- **Ticket Scanner**: Scan or type service ticket ID, validates ticket exists
- **Ticket Context**: Shows ticket number, equipment, customer (if applicable)
- **Qty Stepper**: Large +/- buttons (80px), default qty 1
- **Stock Level Card**: Current stock + reorder point + on-order qty
- **Low Stock Warning**: Yellow/red indicator if stock below reorder point
- **Replenishment Button**: Quick action to trigger replenishment request
- **Confirm Button**: Records consumption, updates stock, links to ticket

## Mobile-Specific
- **Scanner-first**: Yes, part then ticket scanning
- **Gloves-friendly**: Yes, stepper 80px
- **Offline**: Yes, fully supported with queued sync
- **Stock Visibility**: Always shows current stock after scan
- **Replenishment**: One-tap request if stock low
