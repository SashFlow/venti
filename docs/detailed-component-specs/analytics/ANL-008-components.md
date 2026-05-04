# ANL-008: Dead Stock Insights Dashboard - Component Specification

## Screen Reference
- **ID**: ANL-008 | **Name**: Dead Stock Insights Dashboard
- **Base Spec**: `../../analytics-screen-specs/ANL-008 Dead Stock Insights Dashboard.md`
- **Route**: `/analytics/dead-stock`

## Component Inventory
**Primary**: 1. Dead Stock Value KPI, 2. Dead Stock Table, 3. Movement Heatmap
**Secondary**: 4. Category Analysis, 5. Disposition Tracker, 6. Cost Impact
**Modals**: SKU History, Disposition Recommendations

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| sku | string | SKU code |
| lastMovement | date | Last transaction |
| daysStatic | number | Days without movement |
| quantity | number | Current qty |
| value | number | Inventory value |
| category | string | SKU category |

## Layout
**Pattern**: KPI header + table + heatmap
**Header**: Dead stock value + count
**Table**: Dead stock SKU list
**Heatmap**: Movement visualization by category

## Key Components
- **Dead Stock KPI**: Total value of dead stock + SKU count (red badge)
- **Dead Stock Table**: Columns (SKU, Description, Days Static, Qty, Value, Last Movement, Actions)
- **Days Static Filter**: Slider to define threshold (e.g., >90 days, >180 days)
- **Movement Heatmap**: Grid showing movement frequency by category × month
- **Category Analysis**: Bar chart of dead stock value by category
- **Disposition Tracker**: Shows SKUs marked for clearance/write-off with status
- **Cost Impact**: Carrying cost calculation (value × days × rate)
- **Action Buttons**: Mark for Clearance, Request Transfer, Initiate Write-Off
- **Export**: Dead stock report for management review

## Analytics-Specific
- **Dead Stock Definition**: Configurable threshold (days without movement)
- **Heatmap**: Visualize movement patterns
- **Disposition Tracking**: Monitor action taken on dead stock
