# WEB-006: Outbound Wave Planner - Component Specification

## Screen Reference
- **ID**: WEB-006 | **Name**: Outbound Wave Planner
- **Base Spec**: `../../web-screen-specs/WEB-006 Outbound Wave Planner.md`
- **Route**: `/workspace/:workspaceId/outbound/wave-planner`

## Component Inventory
**Primary**: 1. Order Candidate Table, 2. Wave Builder Panel, 3. Impact Simulator, 4. Release Wave Button
**Secondary**: 5. Picker Availability Display, 6. Cutoff Filter, 7. Estimated Completion Time, 8. Rule Templates
**Modals**: Create Wave Modal, Simulation Results, Cancel Wave Confirmation

## Data Schema
| Field | Type | Description |
|-------|------|-------------|
| orderId | string | Order UUID |
| priority | enum | 'critical','high','normal' |
| lineCount | number | Order lines |
| cutoffTime | datetime | Ship-by deadline |
| pickerAvailable | number | Available pickers |
| estimatedTime | number | Minutes to complete |

## Layout
**Pattern**: Left panel (candidate table 60%) + right panel (wave builder 40%)
**Table**: 70px rows, multi-select
**Builder**: Drag-drop or button to add orders
**Simulator**: Bottom panel, collapsible

## Key Components
- **Candidate Table**: Columns: Order ID, Priority, Lines, Cutoff, Customer, Status, Add to Wave
- **Wave Builder Panel**: Selected orders list, total lines, estimated time, picker assignment
- **Picker Availability**: Shows available pickers count + names
- **Add to Wave Button**: Per row or bulk add selected
- **Impact Simulator**: Shows estimated completion time, picker utilization, SLA risk
- **Cutoff Filter**: Filter orders by cutoff time (Next 2hr, Today, Tomorrow)
- **Rule Templates**: Predefined wave rules (High Priority, Zone-Based, FIFO, etc.)
- **Create Wave Button**: Opens modal with wave name, picker assignment, release immediately option
- **Estimated Time**: Shows projected wave completion time based on historical data
- **Release Wave**: Finalizes wave and releases to pickers
- **Cancel Wave**: Cancels draft wave (confirmation required)
- **Simulation Results**: Modal showing picker loading, line distribution, completion ETA

## Web-Specific
- **Drag-Drop**: Drag orders from table to wave builder
- **Impact Simulation**: Real-time estimation as orders added
- **Bulk Operations**: Multi-select orders for batch wave assignment
- **Rule-Based**: Templates for automated wave creation
