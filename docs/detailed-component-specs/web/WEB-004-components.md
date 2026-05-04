# WEB-004: GRN Detail and Line Validation - Component Specification

## Screen Reference
- **ID**: WEB-004 | **Name**: GRN Detail and Line Validation
- **Base Spec**: `../../web-screen-specs/WEB-004 GRN Detail and Line Validation.md`
- **Route**: `/workspace/:workspaceId/inbound/grn/:grnId`

## Component Inventory
**Primary**: 1. GRN Header Panel, 2. Line Item Table, 3. Variance Columns, 4. Serial/Lot Editor
**Secondary**: 5. PO vs Received Comparison, 6. Bulk Validation Button, 7. Audit Trail, 8. Over/Short Approval
**Modals**: Serial/Lot Bulk Editor, Over-Receipt Approval, Variance Reason Dialog

## Data Schema
| Field | Type | Description |
|-------|------|-------------|
| grnId | string | GRN-YYYY-MM-#### |
| poId | string | Source PO |
| lineId | string | Line UUID |
| sku | string | SKU code |
| expectedQty | number | From PO |
| receivedQty | number | Actual received |
| variance | number | Difference |
| serials | array | Serial numbers |
| lots | array | Lot + expiry |
| validationStatus | enum | 'pending','validated','flagged' |

## Layout
**Pattern**: Detail page with header + editable table
**Header**: GRN summary, 120px height
**Table**: Full-width, 70px rows, inline editors
**Footer**: Bulk validation + submit buttons

## Key Components
- **GRN Header**: GRN ID + PO ref + supplier + receiving date + total lines/qty + status
- **Line Table**: Columns: Line #, SKU, Description, Expected Qty, Received Qty, Variance, Serials/Lots, Status, Actions
- **Variance Column**: Color-coded (green=match, yellow=under/over within tolerance, red=exceeds tolerance)
- **PO vs Received**: Side-by-side comparison with diff highlighting
- **Serial Editor**: Click to open modal, grid of serial inputs, paste support for bulk entry
- **Lot Editor**: Click to open modal, lot number + expiry date pairs, duplicate detection
- **Validation Status**: Checkbox per line (validate individually) or bulk validation button
- **Over-Receipt Approval**: Blocking modal if over-receipt exceeds tolerance, requires supervisor approval
- **Audit Trail**: Right panel showing edit history per line (who changed what, when)
- **Bulk Validation**: Select all lines, validate in batch
- **Action Menu**: Per line: Edit Qty, Add Serials/Lots, Flag Discrepancy, Skip Line

## Web-Specific
- **Inline Editing**: Qty fields editable directly in table
- **Bulk Operations**: Multi-select for batch serial/lot entry
- **Comparison View**: Side-by-side PO vs GRN comparison
- **Audit Trail**: Comprehensive edit log with timestamps
