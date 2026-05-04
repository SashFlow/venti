# ADM-016: Integration Queue Monitor - Component Specification

## Screen Reference
- **ID**: ADM-016 | **Name**: Integration Queue Monitor
- **Base Spec**: `../../admin-screen-specs/ADM-016 Integration Queue Monitor.md`
- **Route**: `/admin/integrations/queue-monitor`

## Component Inventory
**Primary**: 1. Event Table, 2. Filter Panel, 3. Queue Depth Metrics, 4. Retry/Pause Controls
**Secondary**: 5. Status Distribution, 6. Lag Monitoring, 7. Event Inspector
**Modals**: Event Detail Drawer, Bulk Retry Dialog, Pause Queue Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| eventId | string | UUID |
| queue | string | Queue name |
| status | enum | 'pending','processing','success','failed','dead_letter' |
| connector | string | Connector ID |
| timestamp | datetime | Event time |
| retryCount | number | Attempts |
| lag | number | Seconds behind real-time |

## Layout
**Pattern**: Metrics dashboard + event table
**Dashboard**: Top panel with queue metrics
**Table**: Event list with filters
**Detail**: Right drawer for selected event

## Key Components
- **Metrics Dashboard**: Total events, pending count, success rate, avg processing time, queue depth
- **Event Table**: Event ID, Queue, Status, Connector, Timestamp, Retry Count, Actions
- **Status Filter**: Tabs for All/Pending/Success/Failed/Dead Letter
- **Queue Filter**: Dropdown to filter by queue name
- **Status Distribution**: Pie chart showing event status breakdown
- **Queue Depth**: Line chart showing pending events over time
- **Lag Monitor**: Shows seconds behind real-time, alerts if >threshold
- **Retry Button**: Per-event or bulk retry for failed events
- **Pause Queue**: Temporarily pause processing for maintenance
- **Event Detail**: Drawer showing full payload, error details, processing log
- **Auto-Refresh**: Toggle real-time updates

## Admin-Specific
- **Real-Time Monitoring**: Live queue status
- **Bulk Operations**: Batch retry/pause
- **Lag Alerting**: Warn if queue falling behind
