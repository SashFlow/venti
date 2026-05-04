# WEB-003: Inbound Workbench - Component Specification

## Screen Reference
- **ID**: WEB-003 | **Name**: Inbound Workbench
- **Base Spec**: `../../web-screen-specs/WEB-003 Inbound Workbench.md`
- **Route**: `/workspace/:workspaceId/inbound/workbench`

## Component Inventory
**Primary**: 1. ASN/PO Table, 2. Search Bar, 3. Filter Sidebar, 4. Create GRN Button
**Secondary**: 5. Dock Assignment Column, 6. Supplier Performance Indicators, 7. Backlog Badge, 8. Status Chips
**Modals**: Create GRN Modal, Dock Assignment Dialog, Route to QC Dialog

## Data Schema
| Field | Type | Description |
|-------|------|-------------|
| id | string | PO or ASN ID |
| supplier | string | Supplier name |
| status | enum | 'pending','receiving','completed','qc_routing' |
| dockAssignment | string | Dock ID |
| pendingLines | number | Not yet received |
| supplierScore | number | Performance 0-100 |

## Layout
**Pattern**: Table with left filter sidebar
**Table**: Sortable columns, 60px row height, pagination
**Sidebar**: Collapsible filters (250px width)
**Header**: Search + Create GRN button

## Key Components
- **Search Bar**: Full-text search (PO, ASN, supplier), debounced
- **Filter Sidebar**: Status, supplier, date range, dock, warehouse filters
- **Data Table**: Columns: PO/ASN ID, Supplier, Status chip, Dock, Pending Lines, Expected Date, Actions
- **Status Chips**: Color-coded (gray=pending, blue=receiving, green=completed, yellow=QC routing)
- **Supplier Score**: Performance indicator (green >90, yellow 70-90, red <70)
- **Backlog Badge**: Red badge if overdue, shows days late
- **Dock Assignment**: Editable dropdown in table
- **Action Menu**: Kebab menu per row (Start Receiving, Create GRN, Route to QC, View Details)
- **Create GRN Modal**: ASN/PO selector, line preview, dock assignment, start receiving checkbox
- **Bulk Actions**: Multi-select rows, bulk dock assignment, bulk route to QC
- **Sort**: Click column headers to sort (multi-column sort with Shift)
- **Pagination**: Page size selector (25/50/100), page navigation

## Web-Specific
- **Table Density**: High density, 60px rows, compact text
- **Inline Editing**: Dock assignment editable in-table
- **Bulk Operations**: Multi-select for batch processing
- **Export**: CSV/Excel export with current filters applied
- **Real-Time**: Polling for status updates every 30s
