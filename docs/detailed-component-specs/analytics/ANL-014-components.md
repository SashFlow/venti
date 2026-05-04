# ANL-014: Scheduled Reports Manager - Component Specification

## Screen Reference
- **ID**: ANL-014 | **Name**: Scheduled Reports Manager
- **Base Spec**: `../../analytics-screen-specs/ANL-014 Scheduled Reports Manager.md`
- **Route**: `/analytics/scheduled-reports`

## Component Inventory
**Primary**: 1. Schedule Table, 2. Schedule Config Form, 3. Execution History
**Secondary**: 4. Recipient Manager, 5. Format Options, 6. Run Now Button
**Modals**: Create Schedule Dialog, Edit Schedule, Execution Log

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| scheduleId | string | UUID |
| reportId | string | FK to report |
| frequency | enum | 'daily','weekly','monthly' |
| schedule | object | Cron expression or config |
| recipients | array | Email list |
| format | enum | 'excel','pdf','csv' |
| status | enum | 'active','paused' |

## Layout
**Pattern**: Schedule list + config panel + history
**Table**: Scheduled reports (60%)
**Config**: Right panel (40%)
**History**: Bottom accordion

## Key Components
- **Schedule Table**: Report Name, Frequency, Recipients, Last Run, Next Run, Status, Actions
- **Frequency Selector**: Dropdown (Daily, Weekly, Monthly, Custom cron)
- **Day/Time Picker**: Select specific days/times for execution
- **Recipient Manager**: Multi-email input with validation
- **Format Options**: Checkboxes (Excel, PDF, CSV) with format-specific settings
- **Report Preview**: Link to preview report before scheduling
- **Enable/Disable Toggle**: Pause schedule without deleting
- **Run Now Button**: Trigger immediate execution
- **Execution History**: Table (Timestamp, Status, Duration, File Size, Download Link)
- **Failure Alerts**: If execution fails, show error with retry button
- **Create Schedule**: Button opens wizard (select report, set frequency, add recipients)

## Analytics-Specific
- **Automated Delivery**: Set-and-forget report distribution
- **Multi-Format**: Support various output formats
- **Execution Tracking**: Monitor delivery success
