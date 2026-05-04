# ADM-007: Device Registration and Health - Component Specification

## Screen Reference
- **ID**: ADM-007 | **Name**: Device Registration and Health
- **Base Spec**: `../../admin-screen-specs/ADM-007 Device Registration and Health.md`
- **Route**: `/admin/devices`

## Component Inventory
**Primary**: 1. Device Table, 2. Registration Form, 3. Health Dashboard, 4. Device Assignment
**Secondary**: 5. Health Status Indicators, 6. Heartbeat Monitor, 7. Battery Tracking, 8. Diagnostics
**Modals**: Register Device Modal, Health Details, Assignment Dialog, Diagnostic Logs

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| deviceId | string | Unique |
| deviceType | enum | 'scanner','printer','mobile' |
| status | enum | 'active','offline','error' |
| assignedTo | string | User ID |
| batteryLevel | number | 0-100 |
| lastHeartbeat | datetime | ISO format |

## Layout
**Pattern**: Device list left (40%) + health panel right (60%)
**Table**: Device inventory with status indicators
**Dashboard**: Health metrics and alerts

## Key Components
- **Device Table**: Device ID, Type (icon), Model, Status chip, Assigned To, Battery, Last Seen, Actions
- **Registration Form**: Device ID, type dropdown, model, warehouse, pairing code
- **Health Dashboard**: Cards showing online/offline/error counts, avg battery, connectivity
- **Status Indicator**: Green (online), gray (offline), red (error) dots
- **Heartbeat Monitor**: Shows last heartbeat time, alerts if >5min
- **Battery Widget**: % with icon, color-coded (green >50%, yellow 20-50%, red <20%)
- **Assignment Dropdown**: Assign device to user/station
- **Diagnostics Button**: Opens modal with device logs, network stats, firmware version
- **Bulk Actions**: Multi-select for batch unassignment, firmware update

## Admin-Specific
- **Real-Time Health**: Live device status monitoring
- **Battery Tracking**: Battery level alerts and history
- **Device Assignment**: User/station assignment management
- **Diagnostics**: Detailed device health logs and metrics
