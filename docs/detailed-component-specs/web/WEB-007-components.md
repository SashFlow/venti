# WEB-007: Pick Performance Monitor - Component Specification

## Screen Reference
- **ID**: WEB-007 | **Name**: Pick Performance Monitor  
- **Base Spec**: `../../web-screen-specs/WEB-007 Pick Performance Monitor.md`
- **Route**: `/workspace/:workspaceId/picking/performance`

## Component Inventory
**Primary**: 1. Active Wave Table, 2. Picker Scorecard Panel, 3. Performance Charts
**Secondary**: 4. Picks/Hour Metric, 5. Short-Pick Frequency, 6. Path Efficiency Graph
**Modals**: Wave Detail Drawer, Picker Detail Modal, Help Trigger Dialog

## Data Schema
| Field | Type |
|-------|------|
| waveId | string |
| picker | string |
| picksPerHour | number |
| shortPickRate | number |
| pathEfficiency | number |

## Layout
**Pattern**: Top metrics bar + table + right panel charts
**Table**: 60% width, wave list
**Charts**: 40% width, performance graphs

## Key Components
- **Wave Table**: Wave ID, Picker, Status, Progress, Picks/Hr, Short Rate, Path Efficiency
- **Picker Scorecard**: Top performers, avg picks/hr, accuracy rate
- **Performance Charts**: Line chart (picks over time), bar chart (picker comparison)
- **Trigger Help**: Button to send help request to picker
- **Filters**: Date range, warehouse, picker, wave status

## Web-Specific
- **Real-Time Updates**: Live picks/hr tracking
- **Comparison Charts**: Visual picker performance comparison
- **Export**: Performance reports (PDF/CSV)
