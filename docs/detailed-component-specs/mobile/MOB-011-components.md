# MOB-011: Pack Handoff Confirmation - Component Specification

## Screen Reference
- **ID**: MOB-011 | **Name**: Pack Handoff Confirmation
- **Base Spec**: `../../mobile-screen-specs/MOB-011 Pack Handoff Confirmation.md`
- **Deep Link**: `venti://pack/handoff/:pickId`

## Component Inventory
**Primary**: 1. Handoff Checklist, 2. Tote/Carton Scan Area, 3. Confirm Handoff Button
**Secondary**: 4. Order References, 5. Label Print Shortcut, 6. Issue Flag
**Modals**: Mismatch Warning, Label Reprint Drawer

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| toteId | string | Scanned tote/carton |
| ordersConfirmed | array | Order IDs |
| labelPrinted | boolean | Label status |

## Layout
**Checklist**: Vertical list, 60px per item
**Scan Area**: Prominent barcode icon, 120px height
**Footer**: Confirm button

## Key Components
- **Checklist Items**: All items picked ☑, All orders match ☑, Label printed ☑, Container scanned ☑
- **Tote Scan**: Large scan prompt, validates against pick wave
- **Order List**: Collapsible list of orders in this handoff
- **Print Button**: Quick access to label reprint
- **Mismatch Detection**: If scanned container doesn't match, shows error + resolution options

## Mobile-Specific
- **Gloves-friendly**: Yes, checklist 60px targets
- **Offline**: Yes, queued handoff
- **Scanner**: Required for tote/carton validation
- **Sound**: Success tone on complete handoff
# MOB-011: Pack Handoff Confirmation - Component Specification

## Screen Reference
- **ID**: MOB-011 | **Name**: Pack Handoff Confirmation
- **Base Spec**: `../../mobile-screen-specs/MOB-011 Pack Handoff Confirmation.md`
- **Deep Link**: `venti://pack/handoff/:taskId`

## Component Inventory
**Primary**: 1. Handoff Checklist, 2. Tote/Carton Scan Block, 3. Confirm Handoff Button
**Secondary**: 4. Order References, 5. Label Print Shortcut, 6. Issue Flag Button
**Modals**: Mismatch Alert, Print Label Options

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| toteId | string | Scanned tote/carton ID |
| orderReferences | array | Order IDs in container |
| checklistComplete | boolean | All items checked |
| labelPrinted | boolean | Label status |

## Layout
**Pattern**: Checklist → Scan → Confirm
**Checklist**: Scrollable list, checkboxes 56px height
**Scan Block**: Center, 120px height
**Footer**: Confirm button

## Key Components
- **Checklist Items**: Large checkboxes with item descriptions (All items picked, Container sealed, Label attached)
- **Tote Scan**: "Scan Tote/Carton ID" prompt, large scan icon, validates against expected ID
- **Order References**: Shows order IDs being handed off, tap to expand details
- **Print Label Button**: Quick shortcut to trigger label reprint if needed
- **Mismatch Detection**: If scanned tote doesn't match expected, shows error + resolution options
- **Confirm Button**: Enabled after checklist complete + valid scan

## Mobile-Specific
- **Gloves-friendly**: Yes, checkbox targets 56px
- **Offline**: Yes, handoff queued
- **Scanner-first**: Yes, tote scan required
- **Sound**: Success tone on handoff complete
