# MOB-004: Inbound Task List - Component Specification

## Screen Reference
- **ID**: MOB-004 | **Name**: Inbound Task List
- **Base Spec**: `../../mobile-screen-specs/MOB-004 Inbound Task List.md`
- **Deep Link**: `venti://tasks/inbound`

## Component Inventory
**Primary**: 1. Inbound Task Cards, 2. Search/Filter Bar, 3. Start Receiving Button
**Secondary**: 4. Dock Assignment Chip, 5. Supplier Info, 6. Pending Lines Count
**Modals**: Task Detail Drawer, Dock Reassignment

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| grnId | string | GRN-YYYY-MM-#### |
| supplier | string | Max 100 chars |
| poReference | string | PO number |
| pendingLines | number | > 0 |
| dockAssignment | string | Dock ID |

## Layout
**Pattern**: Grouped list (by due time: Overdue/Today/Tomorrow)
**Card**: 100px height, grouped headers 40px
**Search**: Sticky at top, barcode scan icon inside

## Key Components
- **Task Card**: GRN ID + supplier name + PO ref + pending lines badge + dock chip + Start button
- **Search Bar**: Text input + barcode scan icon, searches GRN/PO/supplier
- **Group Headers**: Date/time group labels (Overdue, Due in 1hr, etc.)
- **Dock Chip**: Color-coded by dock, shows dock ID
- **Scanner Search**: Scan PO/ASN barcode to filter/jump to task
- **Swipe Actions**: Pin task (stays at top), mark urgent

## Mobile-Specific
- **Scanner-first**: Yes, search via barcode scan
- **Gloves-friendly**: Yes, large cards
- **Offline**: Partial (cached list, can't start new without network)
- **Grouped View**: Reduces cognitive load, prioritizes overdue
