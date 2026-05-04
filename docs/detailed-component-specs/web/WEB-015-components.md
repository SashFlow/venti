# WEB-015: Transfer Order Detail - Component Specification

## Screen Reference
- **ID**: WEB-015 | **Name**: Transfer Order Detail
- **Base Spec**: `../../web-screen-specs/WEB-015 Transfer Order Detail.md`
- **Route**: `/workspace/:workspaceId/transfers/:toId`

## Component Inventory
**Primary**: 1. TO Header, 2. Transfer Line Table, 3. Milestone Checklist, 4. Discrepancy Form
**Secondary**: 5. Planned vs Moved vs Received Comparison, 6. Transit Timeline
**Modals**: Edit Line Modal, Raise Discrepancy Dialog, Milestone Confirmation

## Data Schema
| Field | Type |
|-------|------|
| lineId | string |
| sku | string |
| plannedQty | number |
| movedQty | number |
| receivedQty | number |
| milestones | array |

## Layout
**Pattern**: Header + table + right panel (milestones/timeline)
**Header**: TO summary (100px)
**Table**: 70px rows, comparison columns
**Timeline**: Right panel, vertical

## Key Components
- **TO Header**: TO ID + source/dest + status + total lines + approval status
- **Line Table**: Columns: Line #, SKU, Description, Planned, Moved, Received, Variance, Status
- **Comparison Columns**: Side-by-side planned/moved/received with variance highlighting
- **Milestone Checklist**: Approved, Picking Started, Picked, Dispatched, In Transit, Received
- **Milestone Progress**: Visual checklist with timestamps
- **Discrepancy Button**: Opens form to raise case for variance
- **Discrepancy Form**: Qty variance, reason dropdown, evidence upload
- **Transit Timeline**: Event history with timestamps
- **Edit Lines**: Inline editing for draft TOs

## Web-Specific
- **Three-Way Comparison**: Planned vs moved vs received visualization
- **Milestone Tracking**: Visual progress with timestamps
- **Discrepancy Management**: Inline case creation
