# WEB-020: QC Operations Queue - Component Specification

## Screen Reference
- **ID**: WEB-020 | **Name**: QC Operations Queue
- **Base Spec**: `../../web-screen-specs/WEB-020 QC Operations Queue.md`
- **Route**: `/workspace/:workspaceId/qc/queue`

## Component Inventory
**Primary**: 1. QC Queue Table, 2. Priority/Age Badges, 3. Sample Requirement, 4. Assign Inspector
**Secondary**: 5. Item Type Filter, 6. Time in QC Hold Tracking
**Modals**: Assign Inspector Modal, Escalate Aged Case Dialog, Sample Details

## Data Schema
| Field | Type |
|-------|------|
| qcItemId | string |
| itemType | enum |
| priority | enum |
| age | number |
| sampleSize | number |
| inspector | string |

## Layout
**Pattern**: Table with assignment controls
**Table**: 70px rows, sortable by priority/age
**Toolbar**: Filters and assign buttons

## Key Components
- **QC Queue Table**: Columns: Item ID, Type, Priority, Age, Sample Requirement, Inspector, Time in Hold, Actions
- **Priority Badge**: Color-coded (red=critical, orange=high, blue=normal)
- **Age Badge**: Shows days in queue, red if >3d, yellow if >1d
- **Item Type**: Inbound, Return, Production, Transfer filter dropdown
- **Sample Requirement**: Shows sample size (e.g., "5 units" or "100% inspection")
- **Assign Inspector**: Dropdown to assign QC inspector
- **Time in Hold**: Days/hours item held in QC
- **Escalate Button**: For aged items, creates escalation case
- **Start Inspection**: Opens QC inspection screen (WEB-021)

## Web-Specific
- **Priority Sorting**: Auto-sort by priority + age
- **Bulk Assignment**: Multi-select for batch inspector assignment
- **SLA Tracking**: Highlights items exceeding QC time limits
