# WEB-014: Transfer Order List - Component Specification

## Screen Reference
- **ID**: WEB-014 | **Name**: Transfer Order List
- **Base Spec**: `../../web-screen-specs/WEB-014 Transfer Order List.md`
- **Route**: `/workspace/:workspaceId/transfers`

## Component Inventory
**Primary**: 1. TO Table, 2. Create TO Button, 3. Status Filters, 4. Approval Actions
**Secondary**: 5. Source/Dest Headers, 6. Partial Completion Indicator, 7. Age Tracking
**Modals**: Create TO Modal, Approve/Reject Dialog, TO Detail Drawer

## Data Schema
| Field | Type |
|-------|------|
| transferOrderId | string |
| sourceWarehouse | string |
| destWarehouse | string |
| status | enum |
| lineCount | number |
| age | number |

## Layout
**Pattern**: Table with create button
**Table**: 70px rows, sortable columns
**Header**: Search + Create TO + filters

## Key Components
- **TO Table**: Columns: TO ID, Source, Destination, Status chip, Lines, Created, Age, Actions
- **Create TO Button**: Opens modal with source/dest selection, line entry
- **Status Chips**: Draft, Pending Approval, Approved, Picking, In Transit, Received
- **Source/Dest**: Warehouse codes with icons
- **Partial Indicator**: Badge showing partial completion (e.g., "3/5 lines")
- **Age Tracking**: Days since creation, highlights aged TOs
- **Approval Actions**: Approve/Reject buttons for pending TOs
- **Filters**: Status, source, destination, date range
- **Action Menu**: View Details, Edit (if draft), Approve, Track, Cancel

## Web-Specific
- **Bulk Approval**: Multi-select for batch approval
- **Age Highlighting**: Auto-highlights TOs open >7 days
- **Export**: TO list with filters
