# ANL-011: Alert Center - Component Specification

## Screen Reference
- **ID**: ANL-011 | **Name**: Alert Center
- **Base Spec**: `../../analytics-screen-specs/ANL-011 Alert Center.md`
- **Route**: `/analytics/alerts`

## Component Inventory
**Primary**: 1. Alert Feed, 2. Severity Filter, 3. Alert Detail Panel
**Secondary**: 4. Alert Metrics, 5. Status Actions, 6. Alert History
**Modals**: Alert Detail Drawer, Acknowledgment Dialog

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| alertId | string | UUID |
| severity | enum | 'critical','warning','info' |
| alertType | string | Alert category |
| message | string | Alert text |
| timestamp | datetime | When triggered |
| status | enum | 'new','acknowledged','resolved' |

## Layout
**Pattern**: Feed + detail panel
**Feed**: Left (60%), alert list
**Detail**: Right (40%), selected alert
**Filters**: Top toolbar

## Key Components
- **Alert Feed**: List of alerts (newest first) with severity icons
- **Severity Filter**: Tabs (All, Critical, Warning, Info) with counts
- **Status Filter**: Checkboxes (New, Acknowledged, Resolved)
- **Alert Card**: Severity icon + message + timestamp + status badge
- **Alert Detail**: Expanded view with full context, related data, suggested actions
- **Alert Metrics**: Cards showing total alerts, critical count, resolution time
- **Acknowledge Button**: Mark alert as seen
- **Resolve Button**: Close alert with optional note
- **Related Entities**: Links to related orders/SKUs/locations
- **Auto-Refresh**: Real-time alert updates
- **Search**: Full-text search across alert messages

## Analytics-Specific
- **Real-Time Feed**: Live alert monitoring
- **Severity Prioritization**: Color-coded urgency
- **Action Tracking**: Monitor alert resolution
