# ADM-012: Notification Rule Builder - Component Specification

## Screen Reference
- **ID**: ADM-012 | **Name**: Notification Rule Builder
- **Base Spec**: `../../admin-screen-specs/ADM-012 Notification Rule Builder.md`
- **Route**: `/admin/notification-rules`

## Component Inventory
**Primary**: 1. Rule List, 2. Rule Builder Form, 3. Event Trigger Selector, 4. Recipient Manager
**Secondary**: 5. Severity/Suppression Config, 6. Template Editor, 7. Test Notification
**Modals**: Create Rule Modal, Trigger Config Dialog, Recipient Picker, Test Send

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| ruleId | string | UUID |
| ruleName | string | Required |
| eventTrigger | enum | Predefined events |
| severity | enum | 'critical','warning','info' |
| recipients | array | User/role/email list |
| suppressionWindow | object | Time-based suppression |

## Layout
**Pattern**: Rule list left (35%) + rule builder right (65%)
**List**: Rules sorted by priority
**Builder**: Multi-section form

## Key Components
- **Rule List**: Name, Event, Severity, Recipients, Status, Actions
- **Event Trigger**: Dropdown of system events (Order SLA Breach, Stock Below Threshold, Exception Created, etc.)
- **Condition Builder**: Add conditions (IF SKU category = Electronics AND qty < 10)
- **Severity Selector**: Radio buttons (Critical, Warning, Info)
- **Recipient Manager**: Multi-select users, roles, or custom emails
- **Suppression Window**: Time range picker (Don't send between 10 PM - 6 AM)
- **Frequency Limit**: Throttle notifications (Max 1 per hour, per day, etc.)
- **Template Editor**: Message template with dynamic fields {{orderID}}, {{qty}}, etc.
- **Channel Selector**: Checkboxes (In-App, Email, SMS, Webhook)
- **Test Button**: Send test notification to yourself
- **Enable/Disable Toggle**: Turn rule on/off without deleting

## Admin-Specific
- **Event-Based Rules**: Trigger notifications on system events
- **Condition Logic**: Complex IF/THEN conditions for targeting
- **Suppression Windows**: Time-based notification throttling
- **Multi-Channel**: Support in-app, email, SMS, webhook delivery
