# ANL-003: Order Fulfillment and OTIF Dashboard - Component Specification

## Screen Reference
- **ID**: ANL-003 | **Name**: Order Fulfillment and OTIF Dashboard
- **Base Spec**: `../../analytics-screen-specs/ANL-003 Order Fulfillment and OTIF Dashboard.md`
- **Route**: `/analytics/otif`

## Component Inventory
**Primary**: 1. OTIF Score Card, 2. Fulfillment Funnel, 3. Delay Analysis Chart
**Secondary**: 4. Root Cause Breakdown, 5. Customer Impact View, 6. SLA Performance
**Modals**: Order Detail Drill-Down, Root Cause Explorer

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| otifScore | number | 0-100 percentage |
| onTimeScore | number | 0-100 percentage |
| inFullScore | number | 0-100 percentage |
| delayReasons | array | Categorized causes |
| orderCount | number | Total orders |
| lateOrders | number | Missed SLA |

## Layout
**Pattern**: KPI header + funnel + breakdown grid
**Header**: OTIF score (large) + component scores
**Funnel**: Order → Pick → Pack → Ship stages
**Grid**: Root cause pie charts

## Key Components
- **OTIF Score**: Large percentage with trend indicator, gauge chart
- **On-Time Score**: Separate KPI for on-time deliveries
- **In-Full Score**: Separate KPI for complete orders
- **Fulfillment Funnel**: Stage-by-stage drop-off (Orders → Picked → Packed → Shipped)
- **Delay Analysis**: Bar chart of delay reasons (Pick Capacity, Inventory Short, Carrier Delay)
- **Root Cause Pie**: Breakdown of late order causes
- **Customer Impact**: Table showing customers most affected by delays
- **SLA Performance**: % orders meeting SLA by customer tier
- **Trend Line**: OTIF score over time

## Analytics-Specific
- **Composite Metric**: OTIF = On-Time × In-Full
- **Funnel Visualization**: Multi-stage conversion tracking
- **Root Cause Analysis**: Drill into delay drivers
