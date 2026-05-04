# WEB-013: Stock State Management - Component Specification

## Screen Reference
- **ID**: WEB-013 | **Name**: Stock State Management
- **Base Spec**: `../../web-screen-specs/WEB-013 Stock State Management.md`
- **Route**: `/workspace/:workspaceId/inventory/state-management`

## Component Inventory
**Primary**: 1. State Transition Table, 2. Hold/Release Bulk Actions, 3. Compliance Note Form
**Secondary**: 4. State Quantity Tracking, 5. Reason History, 6. Audit Log
**Modals**: Bulk Hold Dialog, Bulk Release Dialog, Reason Entry Modal

## Data Schema
| Field | Type |
|-------|------|
| sku | string |
| location | string |
| currentState | enum |
| targetState | enum |
| qty | number |
| reason | string |

## Layout
**Pattern**: Table with bulk action toolbar
**Table**: 70px rows, state transitions
**Toolbar**: Sticky top, appears when rows selected

## Key Components
- **State Table**: Columns: SKU, Location, Lot, Current State, Qty, Age, Actions
- **State Filter**: Available, Hold, Quarantine, Damaged, In Transit multi-select
- **Bulk Toolbar**: Hold Selected, Release Selected, Move to State dropdown
- **Hold Action**: Opens dialog with reason dropdown (Quality Issue, Investigation, Recall, etc.) + note
- **Release Action**: Confirmation dialog, releases held stock to available
- **Compliance Note**: Required text area for hold/release justification
- **Quantity Tracking**: Shows qty by state with visual breakdown
- **Reason History**: Audit log of state changes with reasons
- **State Badge**: Color-coded chips (green=available, yellow=hold, red=quarantine)

## Web-Specific
- **Bulk State Changes**: Multi-select for batch operations
- **Reason Tracking**: Complete audit trail with compliance notes
- **Export**: State history report
