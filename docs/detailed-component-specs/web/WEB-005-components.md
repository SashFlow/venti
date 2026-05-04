# WEB-005: Putaway Monitor - Component Specification

## Screen Reference
- **ID**: WEB-005 | **Name**: Putaway Monitor
- **Base Spec**: `../../web-screen-specs/WEB-005 Putaway Monitor.md`
- **Route**: `/workspace/:workspaceId/putaway/monitor`

## Component Inventory
**Primary**: 1. Pending Putaway Table, 2. Capacity Heatmap, 3. Bin Suggestion Column, 4. Recompute Button
**Secondary**: 5. Confidence Scores, 6. Zone Filter, 7. Avg Time Metrics, 8. Reassignment Controls
**Modals**: Recompute Suggestions Modal, Bin Capacity Details, Reassign Zone Dialog

## Data Schema
| Field | Type | Description |
|-------|------|-------------|
| putawayId | string | Task ID |
| sku | string | SKU code |
| qty | number | Units to putaway |
| suggestedBin | string | Recommended bin |
| confidence | number | 0-100 score |
| binCapacity | number | Available space % |
| avgPutawayTime | number | Zone average minutes |

## Layout
**Pattern**: Split layout (table left 60%, heatmap right 40%)
**Table**: 70px rows, sortable/filterable
**Heatmap**: Zone-based capacity visualization
**Header**: Zone filter + recompute button

## Key Components
- **Pending Table**: Columns: Task ID, SKU, Qty, Suggested Bin, Confidence, Capacity, Assigned To, Age, Actions
- **Confidence Score**: Badge 0-100 (green >80, yellow 60-80, red <60)
- **Capacity Column**: % available + visual bar (green <70%, yellow 70-90%, red >90%)
- **Capacity Heatmap**: Grid of zones color-coded by occupancy
- **Zone Filter**: Multi-select dropdown (Zone A, Zone B, etc.)
- **Recompute Button**: Triggers suggestion recalculation for selected tasks
- **Avg Time Metric**: Shows average putaway time per zone
- **Reassignment**: Bulk reassign by zone or picker
- **Action Menu**: Per row: Accept Suggestion, Request Alternate, Reassign, View Bin Details
- **Bin Details Modal**: Shows bin contents, capacity, recent activity
- **Heatmap Interaction**: Click zone in heatmap to filter table to that zone

## Web-Specific
- **Split Layout**: Table + heatmap side-by-side
- **Confidence Scoring**: ML-based suggestion confidence display
- **Real-Time Capacity**: Live capacity updates
- **Bulk Recompute**: Recalculate suggestions for selected tasks
