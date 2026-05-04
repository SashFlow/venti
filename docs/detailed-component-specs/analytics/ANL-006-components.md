# ANL-006: Cost Breakdown and Landed Cost View - Component Specification

## Screen Reference
- **ID**: ANL-006 | **Name**: Cost Breakdown and Landed Cost View
- **Base Spec**: `../../analytics-screen-specs/ANL-006 Cost Breakdown and Landed Cost View.md`
- **Route**: `/analytics/cost-breakdown`

## Component Inventory
**Primary**: 1. Landed Cost Waterfall, 2. Cost Component Table, 3. SKU Cost Comparison
**Secondary**: 4. Supplier Cost Analysis, 5. Cost Trend, 6. Variance Report
**Modals**: Cost Detail Drill-Down, Variance Analysis

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| sku | string | SKU code |
| basePrice | number | Currency |
| freight | number | Shipping cost |
| duties | number | Import duties |
| handling | number | Warehouse handling |
| landedCost | number | Total cost |

## Layout
**Pattern**: Waterfall chart + breakdown table + trends
**Chart**: Waterfall showing cost build-up
**Table**: Detailed cost components
**Trends**: Line chart of cost over time

## Key Components
- **Landed Cost Waterfall**: Cascading bar chart (Base Price + Freight + Duties + Handling = Landed Cost)
- **Cost Breakdown Table**: Columns (SKU, Base, Freight, Duties, Handling, Total, %)
- **SKU Selector**: Search SKU or select from dropdown
- **Supplier Comparison**: Table comparing landed cost across suppliers
- **Cost Trend**: Line chart showing landed cost trend for selected SKU
- **Variance Report**: Actual vs expected landed cost with variance %
- **Cost Component %**: Pie chart showing % of each cost component
- **Export**: Detailed cost analysis export
- **Date Range**: Filter for historical cost analysis

## Analytics-Specific
- **Waterfall Visualization**: Show cost build-up clearly
- **Supplier Comparison**: Identify best-value suppliers
- **Variance Tracking**: Monitor cost deviations
