# WEB-019: Cycle Count Reconciliation Desk - Component Specification

## Screen Reference
- **ID**: WEB-019 | **Name**: Cycle Count Reconciliation Desk
- **Base Spec**: `../../web-screen-specs/WEB-019 Cycle Count Reconciliation Desk.md`
- **Route**: `/workspace/:workspaceId/cycle-count/reconciliation`

## Component Inventory
**Primary**: 1. Variance Table, 2. Adjustment Approval Form, 3. Investigation Trigger
**Secondary**: 4. Book vs Count vs Recount Columns, 5. Variance Value/Threshold Display
**Modals**: Approve Adjustment Modal, Reject Modal, Investigation Dialog

## Data Schema
| Field | Type |
|-------|------|
| countId | string |
| sku | string |
| binLocation | string |
| bookQty | number |
| countQty | number |
| recountQty | number |
| variance | number |
| varianceValue | number |

## Layout
**Pattern**: Table with approval workflow
**Table**: 70px rows, multi-column comparison
**Toolbar**: Bulk approve/reject buttons

## Key Components
- **Variance Table**: Columns: Bin, SKU, Book Qty, Count Qty, Recount Qty, Variance Qty, Variance %, Value, Threshold, Status, Actions
- **Three-Way Comparison**: Book vs count vs recount side-by-side
- **Variance Highlighting**: Color-coded (green within threshold, yellow near threshold, red exceeds)
- **Variance Value**: Financial impact of variance
- **Threshold Display**: Shows acceptable variance threshold (e.g., ±5%)
- **Approval Actions**: Approve Adjustment (updates book qty), Reject (keeps book qty), Investigate
- **Approval Form**: Requires supervisor approval if exceeds threshold, reason dropdown
- **Investigation Trigger**: Creates case for investigation, assigns to specialist
- **Bulk Actions**: Multi-select for batch approval

## Web-Specific
- **Threshold-Based Workflow**: Auto-approval below threshold, manual above
- **Financial Impact**: Shows variance cost for decision-making
- **Bulk Reconciliation**: Batch approval for efficient processing
