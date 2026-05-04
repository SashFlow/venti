# WEB-012: Location Utilization Map - Component Specification

## Screen Reference
- **ID**: WEB-012 | **Name**: Location Utilization Map
- **Base Spec**: `../../web-screen-specs/WEB-012 Location Utilization Map.md`
- **Route**: `/workspace/:workspaceId/inventory/utilization`

## Component Inventory
**Primary**: 1. Capacity Heatmap, 2. Zone Class Filters, 3. Bin Detail Popup
**Secondary**: 4. Occupancy Percent Legend, 5. Constraint Violations, 6. Fast/Slow Alignment
**Modals**: Bin Details Drawer, Constraint Details, Rebalance Suggestions

## Data Schema
| Field | Type |
|-------|------|
| locationId | string |
| occupancy | number |
| capacity | number |
| class | enum |
| violations | array |

## Layout
**Pattern**: Full-screen heatmap with filter toolbar
**Heatmap**: Grid visualization (zones → aisles → bins)
**Legend**: Bottom-right, color scale
**Toolbar**: Top filters

## Key Components
- **Heatmap Grid**: Color-coded bins (green <70%, yellow 70-90%, red >90%, gray empty)
- **Zone Filter**: Multi-select dropdown (Zone A, B, C, etc.)
- **Class Filter**: Storage class filter (Fast-moving, Slow-moving, Bulk, etc.)
- **Occupancy Legend**: Color scale showing % ranges
- **Bin Popup**: Click bin shows: Location ID, Occupancy %, Capacity, Contents, Last Activity
- **Constraint Violations**: Highlights bins with issues (wrong class, capacity exceeded, etc.)
- **Fast/Slow Alignment**: Shows if fast-movers in optimal locations
- **Rebalance Button**: Suggests bin moves to optimize utilization

## Web-Specific
- **Interactive Heatmap**: Zoom/pan warehouse visualization
- **Drill-Down**: Click zone → aisle → bin for detail
- **Real-Time**: Live occupancy updates
