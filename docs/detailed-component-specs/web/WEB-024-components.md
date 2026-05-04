# WEB-024: Clearance and Write-Off Console - Component Specification

## Screen Reference
- **ID**: WEB-024 | **Name**: Clearance and Write-Off Console
- **Base Spec**: `../../web-screen-specs/WEB-024 Clearance and Write-Off Console.md`
- **Route**: `/workspace/:workspaceId/inventory/write-off`

## Component Inventory
**Primary**: 1. Liquidation Approval Table, 2. Batch Disposition Editor, 3. GL Entry Exporter
**Secondary**: 4. Gross/Recoverable Values, 5. Approval Policy Checks, 6. Accounting Status
**Modals**: Approve Liquidation Modal, Batch Edit Dialog, GL Preview

## Data Schema
| Field | Type |
|-------|------|
| sku | string |
| qty | number |
| grossValue | number |
| recoverableValue | number |
| disposition | enum |
| approvalStatus | enum |
| glStatus | enum |

## Layout
**Pattern**: Approval workflow table
**Table**: 70px rows, financial columns
**Toolbar**: Approval actions + GL export

## Key Components
- **Liquidation Table**: Columns: SKU, Qty, Gross Value, Recoverable Value, Disposition, Approval Status, GL Status, Actions
- **Gross Value**: Book value of inventory
- **Recoverable Value**: Expected recovery (liquidation price, scrap value, or $0 for write-off)
- **Disposition**: Liquidation, Salvage, Scrap, Write-Off dropdown
- **Approval Status**: Pending, Approved, Rejected chips
- **Approval Policy**: Auto-approve if <$X, requires manager if >$X, requires director if >$Y
- **Batch Editor**: Multi-select, set disposition for batch
- **Approve Button**: Per row or bulk approval
- **GL Entry Exporter**: Generates accounting journal entries (CSV/Excel)
- **GL Status**: Not Exported, Exported, Posted chips
- **Accounting Preview**: Shows debit/credit entries before export

## Web-Specific
- **Approval Workflow**: Multi-level approval based on value thresholds
- **GL Integration**: Generates accounting entries for ERP import
- **Batch Processing**: Efficient bulk disposition and approval
