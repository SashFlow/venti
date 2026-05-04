# ANL-005: Inventory Valuation Dashboard - Component Specification

## Screen Reference
- **ID**: ANL-005 | **Name**: Inventory Valuation Dashboard
- **Base Spec**: `../../analytics-screen-specs/ANL-005 Inventory Valuation Dashboard.md`
- **Route**: `/analytics/inventory-valuation`

## Component Inventory
**Primary**: 1. Total Valuation Card, 2. Valuation by Category Chart, 3. Top SKUs Table
**Secondary**: 4. Valuation Method Toggle, 5. Movement Impact, 6. Trend Analysis
**Modals**: SKU Valuation Detail, Method Comparison

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| totalValue | number | Currency |
| valuationMethod | enum | 'FIFO','LIFO','Weighted Avg' |
| categoryValue | object | Category → value map |
| skuValue | array | SKU-level valuations |
| movementImpact | number | Value change |

## Layout
**Pattern**: Summary card + breakdown charts + table
**Header**: Total valuation (large) + method selector
**Charts**: Category pie chart + trend line
**Table**: Top SKUs by value

## Key Components
- **Total Valuation**: Large currency value with trend (↑/↓ from last period)
- **Valuation Method**: Dropdown (FIFO, LIFO, Weighted Average) with method info tooltip
- **Category Breakdown**: Donut chart showing value % by category
- **Top SKUs**: Table (SKU, Description, Qty, Unit Cost, Total Value) top 50
- **Trend Chart**: Line chart of total inventory value over time
- **Movement Impact**: Shows how receipts/shipments affected valuation
- **Method Comparison**: Side-by-side comparison of methods (FIFO vs LIFO impact)
- **Warehouse Filter**: Multi-select for warehouse-specific valuation
- **Export**: Detailed valuation report (Excel with all SKUs)

## Analytics-Specific
- **Multi-Method Support**: Compare valuation methods
- **Impact Analysis**: Understand how transactions affect value
- **Category Drill-Down**: Click chart to filter table
