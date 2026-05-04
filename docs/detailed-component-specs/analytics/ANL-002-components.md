# ANL-002: Inbound vs Outbound Trend Analysis - Component Specification

## Screen Reference
- **ID**: ANL-002 | **Name**: Inbound vs Outbound Trend Analysis
- **Base Spec**: `../../analytics-screen-specs/ANL-002 Inbound vs Outbound Trend Analysis.md`
- **Route**: `/analytics/inbound-outbound-trends`

## Component Inventory
**Primary**: 1. Dual-Axis Chart, 2. Volume Comparison Table, 3. Throughput Metrics
**Secondary**: 4. Granularity Selector, 5. Category Breakdown, 6. Forecast Overlay
**Modals**: Chart Config Dialog, Export Options

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| period | date | Day/week/month |
| inboundVolume | number | Units received |
| outboundVolume | number | Units shipped |
| inboundOrders | number | Receipt count |
| outboundOrders | number | Shipment count |

## Layout
**Pattern**: Chart + data table
**Chart**: Full-width dual-axis (inbound blue, outbound green)
**Table**: Below chart, daily breakdown
**Filters**: Top toolbar

## Key Components
- **Dual-Axis Chart**: Line chart with inbound (blue) and outbound (green) lines
- **Granularity Selector**: Radio buttons (Daily, Weekly, Monthly)
- **Volume Metrics**: Cards showing total inbound/outbound, net inventory change
- **Comparison Table**: Columns (Date, Inbound Vol, Outbound Vol, Net, % Balance)
- **Category Breakdown**: Stacked bar chart by SKU category
- **Forecast Overlay**: Toggle to show predicted volumes (dotted line)
- **Legend**: Interactive (click to toggle series visibility)
- **Export**: CSV export with raw data

## Analytics-Specific
- **Dual-Axis Visualization**: Compare two metrics on same chart
- **Forecast Integration**: Predictive analytics overlay
- **Granularity Control**: Switch between time aggregations
