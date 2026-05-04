# ANL-001: Operational KPI Dashboard - Component Specification

## Screen Reference
- **ID**: ANL-001 | **Name**: Operational KPI Dashboard
- **Base Spec**: `../../analytics-screen-specs/ANL-001 Operational KPI Dashboard.md`
- **Route**: `/analytics/operations`

## Component Inventory
**Primary**: 1. KPI Cards, 2. Trend Charts, 3. Time Range Selector, 4. Warehouse Filter
**Secondary**: 5. Comparison Toggle, 6. Drill-Down Links, 7. Export Button
**Modals**: Chart Detail Modal, Data Export Dialog

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| metricId | string | KPI identifier |
| value | number | Current value |
| previousValue | number | Comparison baseline |
| trend | enum | 'up','down','flat' |
| unit | string | %, count, $ |
| chartData | array | Time series data |

## Layout
**Pattern**: Dashboard grid (4-column responsive)
**Header**: Filters + time range + actions
**Grid**: KPI cards (3 per row) + charts (2 per row)
**Spacing**: 16px gap between cards

## Key Components
- **KPI Cards**: Value + label + trend indicator (↑ green, ↓ red, → gray) + % change
- **Time Range**: Dropdown (Today, Yesterday, Last 7d, Last 30d, Custom range)
- **Warehouse Filter**: Multi-select dropdown (All Warehouses, WH-01, WH-02)
- **Comparison Toggle**: Compare vs Previous Period / Same Period Last Year
- **Trend Charts**: Line/bar charts with hover tooltips
- **Drill-Down Links**: Click KPI card → detail report
- **Export Button**: Download dashboard as PDF or Excel
- **Refresh Button**: Manual refresh, auto-refresh toggle (30s, 1m, 5m)

## Analytics-Specific
- **Real-Time Updates**: Auto-refresh with configurable intervals
- **Period Comparison**: Compare metrics across time periods
- **Interactive Charts**: Click to filter, drill-down for details
