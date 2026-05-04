# ADM-019: Audit Log Explorer - Component Specification

## Screen Reference
- **ID**: ADM-019 | **Name**: Audit Log Explorer
- **Base Spec**: `../../admin-screen-specs/ADM-019 Audit Log Explorer.md`
- **Route**: `/admin/audit/logs`

## Component Inventory
**Primary**: 1. Audit Table, 2. Search/Filter Panel, 3. Diff Viewer
**Secondary**: 4. Before/After Comparison, 5. Export Reports, 6. User Activity Timeline
**Modals**: Audit Detail Drawer, Diff Viewer, Export Options

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| auditId | string | UUID |
| timestamp | datetime | Event time |
| user | string | User ID |
| action | enum | 'create','update','delete','login','approve' |
| entityType | enum | 'user','order','sku','config' |
| entityId | string | Entity UUID |
| changes | object | Before/after values |
| ipAddress | string | Source IP |

## Layout
**Pattern**: Search panel + table + detail drawer
**Search**: Left panel with filters
**Table**: Center, audit event list
**Drawer**: Right panel with change details

## Key Components
- **Search Panel**: User, entity type, action, date range filters
- **Full-Text Search**: Search by entity ID, user email, or change values
- **Audit Table**: Timestamp, User, Action, Entity Type, Entity ID, IP, Details
- **Action Filter**: Create/Update/Delete/Login/Approve/Reject multi-select
- **Entity Type Filter**: User/Order/SKU/Config/Permission multi-select
- **Date Range**: Predefined (Today, Last 7d, Last 30d) or custom range
- **Audit Detail Drawer**: Opens on row click, shows full event context
- **Diff Viewer**: Side-by-side comparison of before/after values
- **Field-Level Changes**: Highlights changed fields with color coding
- **User Activity Timeline**: Shows all actions by a specific user
- **IP Address**: Shows source of change for security tracking
- **Export**: CSV/Excel export with current filters, generates compliance reports

## Admin-Specific
- **Complete Audit Trail**: Every change tracked
- **Diff Visualization**: Clear before/after comparison
- **Compliance Reports**: Exportable audit logs for compliance
