# ANL-013: Report Builder - Component Specification

## Screen Reference
- **ID**: ANL-013 | **Name**: Report Builder
- **Base Spec**: `../../analytics-screen-specs/ANL-013 Report Builder.md`
- **Route**: `/analytics/report-builder`

## Component Inventory
**Primary**: 1. Field Selector, 2. Filter Builder, 3. Preview Table, 4. Chart Config
**Secondary**: 5. Aggregation Options, 6. Sort/Group Controls, 7. Report Templates
**Modals**: Save Report Dialog, Template Library, Chart Designer

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| reportId | string | UUID |
| reportName | string | Required, unique |
| dataSource | enum | 'orders','inventory','shipments' |
| fields | array | Selected columns |
| filters | array | Filter conditions |
| chartType | enum | 'table','bar','line','pie' |

## Layout
**Pattern**: Builder sidebar + preview canvas
**Sidebar**: Field/filter/chart selectors (30%)
**Canvas**: Report preview (70%)
**Footer**: Save/Run/Export buttons

## Key Components
- **Data Source**: Dropdown (Orders, Inventory, Shipments, Receipts, Transfers)
- **Field Selector**: Multi-select checkbox list of available fields
- **Filter Builder**: Add filters with field, operator (=, >, <, contains), value
- **Aggregation**: Sum, Count, Average, Min, Max per field
- **Group By**: Select fields to group results
- **Sort**: Drag-drop to set sort priority
- **Preview Table**: Live preview of report data
- **Chart Type**: Radio buttons (Table, Bar, Line, Pie, Scatter)
- **Chart Config**: Axis assignment, colors, labels
- **Report Templates**: Load pre-built reports (Inventory Summary, Sales by Category)
- **Save Button**: Save report for reuse
- **Export**: Run and export to Excel/PDF/CSV

## Analytics-Specific
- **Visual Builder**: No-code report creation
- **Live Preview**: See results as you build
- **Template Library**: Start from common reports
