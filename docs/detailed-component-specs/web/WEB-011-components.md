# WEB-011: Inventory Explorer - Component Specification

## Screen Reference
- **ID**: WEB-011 | **Name**: Inventory Explorer
- **Base Spec**: `../../web-screen-specs/WEB-011 Inventory Explorer.md`
- **Route**: `/workspace/:workspaceId/inventory/explorer`

## Component Inventory
**Primary**: 1. Advanced Search Bar, 2. Multi-Filter Panel, 3. Stock Grid Table, 4. Export Button
**Secondary**: 5. Age Buckets, 6. Recent Movement Summary, 7. Available vs Reserved Split
**Modals**: Filter Builder, Expiry Risk Details, Location History Drawer

## Data Schema
| Field | Type |
|-------|------|
| sku | string |
| location | string |
| lot | string |
| serial | string |
| qty | number |
| state | enum |
| age | number |

## Layout
**Pattern**: Search/filter top + table below
**Filter Panel**: Collapsible left sidebar (280px)
**Table**: Full-width, 70px rows, pagination

## Key Components
- **Advanced Search**: Multi-field search (SKU, location, lot, serial) with auto-complete
- **Filter Panel**: SKU, Location, Lot, Serial, State, Age, Expiry filters with date ranges
- **Stock Grid**: Columns: SKU, Description, Location, Lot, Serial, Qty, State, Age, Last Movement, Expiry
- **State Filter**: Available, Reserved, Hold, Quarantine, In Transit multi-select
- **Age Buckets**: Filter by age ranges (<30d, 30-60d, 60-90d, >90d)
- **Recent Movement**: Shows last movement date and type
- **Available vs Reserved**: Shows split of qty by state
- **Expiry Risk**: Highlights items expiring soon (red <7d, yellow <30d)
- **Export**: CSV/Excel export with filters applied
- **Bulk Actions**: Multi-select for bulk state change, bulk transfer

## Web-Specific
- **Advanced Filtering**: Complex multi-field filters with AND/OR logic
- **Pagination**: Large datasets, server-side pagination
- **Export**: Custom export with selected columns
