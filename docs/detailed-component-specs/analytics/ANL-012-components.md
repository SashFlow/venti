# ANL-012: Notification Delivery Analytics - Component Specification

## Screen Reference
- **ID**: ANL-012 | **Name**: Notification Delivery Analytics
- **Base Spec**: `../../analytics-screen-specs/ANL-012 Notification Delivery Analytics.md`
- **Route**: `/analytics/notification-delivery`

## Component Inventory
**Primary**: 1. Delivery Metrics, 2. Channel Performance, 3. Failure Analysis
**Secondary**: 4. Delivery Timeline, 5. User Engagement, 6. Retry Stats
**Modals**: Delivery Detail, Failure Analysis

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| notificationId | string | UUID |
| channel | enum | 'in_app','email','sms','webhook' |
| status | enum | 'delivered','failed','pending' |
| timestamp | datetime | Sent time |
| deliveryTime | number | Milliseconds to deliver |
| failureReason | string | Error message |

## Layout
**Pattern**: Metrics dashboard + channel breakdown + timeline
**Header**: Delivery KPIs
**Charts**: Channel performance bars + timeline
**Table**: Recent notifications

## Key Components
- **Delivery Metrics**: Cards (Total Sent, Delivered, Failed, Success Rate %)
- **Channel Performance**: Bar chart (Email, SMS, In-App, Webhook) with success rates
- **Failure Analysis**: Pie chart of failure reasons (Invalid Address, Rate Limit, Timeout, etc.)
- **Delivery Timeline**: Line chart showing notifications sent over time
- **Avg Delivery Time**: Metric by channel (e.g., Email: 2.3s, SMS: 1.1s)
- **User Engagement**: Click-through rate for in-app notifications
- **Retry Stats**: Success rate after retry attempts
- **Recent Notifications**: Table (Timestamp, Channel, Status, Recipient, Delivery Time)
- **Filter by Rule**: Select notification rule to analyze
- **Export**: Delivery report for auditing

## Analytics-Specific
- **Channel Comparison**: Identify most reliable channel
- **Failure Patterns**: Understand delivery issues
- **Performance Monitoring**: Track delivery speed
