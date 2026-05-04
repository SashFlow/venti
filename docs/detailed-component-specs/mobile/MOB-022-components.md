# MOB-022: Alerts and Notifications - Component Specification

## Screen Reference
- **ID**: MOB-022 | **Name**: Alerts and Notifications
- **Base Spec**: `../../mobile-screen-specs/MOB-022 Alerts and Notifications.md`
- **Deep Link**: `venti://alerts`

## Component Inventory
**Primary**: 1. Alert List Cards, 2. Severity Filter Tabs, 3. Alert Actions
**Secondary**: 4. Unread Count Badge, 5. Alert Details Drawer, 6. Jump to Task Link
**Modals**: Alert Details, Acknowledge Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| alertId | string | UUID |
| severity | enum | 'critical','warning','info' |
| title | string | Alert headline |
| dueBy | datetime | Action deadline |
| owner | string | Assigned user |
| status | enum | 'unread','read','acknowledged' |
| taskLink | string | Deep link to related task |

## Layout
**Header**: Alerts title + unread count badge
**Tabs**: Severity filter (Critical/Warning/Info)
**List**: Vertical scrolling alert cards
**Pull-to-refresh**: Standard pattern

## Key Components
- **Severity Tabs**: Horizontal tabs with count badges (Critical: 3, Warning: 12, Info: 5)
- **Alert Card**: Severity icon + title + due-by time + owner + status indicator (100px height)
- **Unread Badge**: Red dot indicator on unread alerts
- **Due-By Timer**: Color-coded countdown (red <1hr, yellow <4hr, gray >4hr)
- **Card Actions**: Tap to open details, swipe right to acknowledge, swipe left to dismiss
- **Alert Details**: Bottom sheet with full message, related entity, action buttons
- **Jump Link**: "Go to Task" button, deep links to related screen (pick task, exception, etc.)
- **Acknowledge Button**: Marks alert as read/acknowledged
- **Filter Persistence**: Remembers last selected severity tab

## Mobile-Specific
- **Gloves-friendly**: Yes, card height 100px
- **Offline**: Yes, read cache with pending actions queued
- **Swipe Gestures**: Quick acknowledge/dismiss
- **Deep Links**: Alerts link directly to target screens (e.g., alert for exception opens MOB-023)
- **Badge Updates**: Real-time unread count updates
