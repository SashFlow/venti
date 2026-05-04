# MOB-023: Exception Inbox - Component Specification

## Screen Reference
- **ID**: MOB-023 | **Name**: Exception Inbox
- **Base Spec**: `../../mobile-screen-specs/MOB-023 Exception Inbox.md`
- **Deep Link**: `venti://exceptions`

## Component Inventory
**Primary**: 1. Exception List, 2. Detail Drawer, 3. Severity Filters, 4. Claim/Resolve Actions
**Secondary**: 5. SLA Timer, 6. Root Cause Form, 7. Escalate Button, 8. Recurring Badge
**Modals**: Root Cause Entry, Escalation Dialog, Resolution Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| exceptionId | string | UUID |
| type | enum | 'inventory','order','quality','system' |
| severity | enum | 'critical','high','medium','low' |
| slaDeadline | datetime | Resolution deadline |
| status | enum | 'open','claimed','in_progress','resolved','escalated' |
| owner | string | Claimed by user |
| rootCause | string | Analysis |
| resolution | string | Action taken |
| isRecurring | boolean | Recurring pattern detected |

## Layout
**Header**: Exceptions + filter tabs
**List**: Exception cards (120px each)
**Drawer**: Bottom sheet detail view
**Footer**: Action buttons when exception selected

## Key Components
- **Filter Tabs**: By severity (Critical/High/Medium/Low) with counts
- **Exception Card**: Type icon + title + severity badge + SLA countdown + status chip (120px)
- **Recurring Badge**: Orange badge if recurring exception detected
- **SLA Timer**: Real-time countdown, color-coded urgency
- **Claim Button**: Assigns exception to current user
- **Detail Drawer**: Shows full exception details, related entities, timeline
- **Root Cause Form**: Text area + predefined cause dropdown
- **Resolution Form**: Text area describing action taken
- **Escalate Button**: Opens escalation dialog with supervisor selection
- **Scanner Jump**: Scan document ID to open linked exception
- **Swipe Actions**: Swipe right to claim, swipe left to unclaim

## Mobile-Specific
- **Gloves-friendly**: Yes, cards 120px
- **Offline**: Partial (read cache, actions queued)
- **SLA Visibility**: Always-on countdown keeps urgency visible
- **Quick Claim**: Swipe gesture for rapid claim
- **Deep Links**: Can navigate from alerts/notifications directly to exception
