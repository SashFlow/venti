# WEB-001: Global Control Tower Dashboard - Component Specification

## Screen Reference
- **ID**: WEB-001 | **Name**: Global Control Tower Dashboard
- **Base Spec**: `../../web-screen-specs/WEB-001 Global Control Tower Dashboard.md`
- **Route**: `/workspace/:workspaceId/control-tower`

## Component Inventory
**Primary**: 1. KPI Card Grid, 2. Warehouse Scope Selector, 3. Exception Heatmap, 4. Date/Shift Filter
**Secondary**: 5. Status Chips, 6. Drill-Down Links, 7. Refresh Button, 8. Real-Time Indicators
**Panels**: Multi-panel dashboard layout (2x2 KPI grid, heatmap below)

## Data Schema
| Field | Type | Description |
|-------|------|-------------|
| warehouseId | string | Selected warehouse scope |
| period | enum | 'today','shift','yesterday','7d' |
| kpis | object | Inbound/outbound/inventory/fulfillment metrics |
| exceptions | array | Critical/warning/info alerts |

## Layout - Web Optimized
**Pattern**: Dashboard grid layout
**KPI Cards**: 2x2 grid on desktop, stacked on tablet
**Heatmap**: Full-width below KPIs
**Filters**: Top-right header area

## Key Components
- **KPI Cards**: Large metric (72px font), delta indicator (↑↓), sparkline trend, drill-down link
  - Inbound Throughput, Outbound OTIF, Inventory Health, Exception Count
- **Warehouse Selector**: Dropdown (multi-select), shows "All Warehouses" or list
- **Exception Heatmap**: Color-coded grid (green/yellow/red) by severity x category
- **Date/Shift Filter**: Segmented control (Today/Current Shift/Yesterday/Last 7 Days)
- **Real-Time Badge**: "Live" indicator with pulse animation
- **Refresh Button**: Manual refresh + last updated timestamp
- **Status Chips**: Color-coded (SLA Risk, Capacity Alert, etc.)
- **Drill Links**: Click KPI card opens detail screen (WEB-003 for inbound, WEB-006 for outbound, etc.)

## Web-Specific
- **Multi-Panel**: Dashboard with 6-8 panels visible simultaneously
- **Real-Time Updates**: WebSocket updates for KPIs every 30s
- **Responsive**: 2-column on desktop, 1-column on tablet
- **Export**: CSV export of current KPI snapshot
- **Customization**: User can pin/unpin specific KPIs
