# MOB-019: Returns Intake - Component Specification

## Screen Reference
- **ID**: MOB-019 | **Name**: Returns Intake
- **Base Spec**: `../../mobile-screen-specs/MOB-019 Returns Intake.md`
- **Deep Link**: `venti://returns/intake`

## Component Inventory
**Primary**: 1. Return Reference Input, 2. Category Selection, 3. Item Scan Area, 4. Confirm Intake Button
**Secondary**: 5. Customer/Order Details, 6. Manual Lookup, 7. Return Reason
**Modals**: Order Lookup Drawer, Unknown Item Resolution

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| returnReference | string | SRN or order ID |
| category | enum | 'standard','warranty','doa','damaged' |
| itemsScan | array | Scanned items |
| customerInfo | object | Name, order details |
| returnReason | string | Customer-provided reason |

## Layout
**Header**: Return intake title + return reference
**Category**: Large radio cards, 100px each
**Scan Area**: Middle, item-by-item scanning
**Footer**: Confirm button

## Key Components
- **Reference Input**: Scan or type SRN/order barcode, validates and loads customer info
- **Category Cards**: Large touch cards (Standard Return, Warranty, DOA, Damaged in Transit)
- **Item Scanner**: Scan each returned item, validates against order
- **Customer Display**: Shows customer name, original order details, items ordered
- **Manual Lookup**: If barcode unreadable, search by order number or customer name
- **Item List**: Real-time list of scanned items with quantity
- **Return Reason**: Text area for customer's stated reason
- **Warranty Badge**: If within warranty period, shows badge
- **DOA Badge**: If eligible for dead-on-arrival policy

## Mobile-Specific
- **Scanner-first**: Yes, SRN then items
- **Gloves-friendly**: Yes, category cards 100px
- **Offline**: Yes, queued intake
- **Manual Fallback**: Search drawer for failed scans
