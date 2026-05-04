# MOB-003: Home Task Queue - Component Specification

## Screen Reference
- **ID**: MOB-003 | **Name**: Home Task Queue
- **Base Spec**: `../../mobile-screen-specs/MOB-003 Home Task Queue.md`
- **Deep Link**: `venti://tasks/home`

## Component Inventory
**Primary**: 1. Task Cards, 2. Filter Chips, 3. Start Task Button, 4. Pull-to-Refresh
**Secondary**: 5. SLA Timer, 6. Priority Badges, 7. Exception Count Badge, 8. Search Bar
**Floating**: Scanner Shortcut FAB, Exception Badge (top-right)

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| taskId | string | UUID |
| taskType | enum | 'inbound','pick','putaway','count','transfer' |
| priority | enum | 'critical','high','normal','low' |
| slaMinutes | number | Remaining minutes |
| assignedTo | string | User ID or null |

## Layout
**Pattern**: Vertical scrolling list, filter chips sticky at top
**Card**: 120px height, swipeable for quick actions
**Spacing**: 12px gap between cards

## Key Components
- **Task Card**: Task type icon + title + SLA countdown + source/dest + priority badge + Start CTA
- **Filter Chips**: Horizontal scroll, multi-select, show count per filter
- **SLA Timer**: Color-coded (red <15min, yellow <60min, green >60min), updates live
- **Swipe Actions**: Right swipe = quick claim, left swipe = quick pause
- **Scanner FAB**: Bottom-right, scan task ID to jump directly
- **Pull-to-Refresh**: Standard iOS/Android pattern, refreshes queue

## Mobile-Specific
- **Scanner-first**: Yes, FAB for quick scan-to-jump
- **Gloves-friendly**: Yes, card height 120px minimum
- **Offline**: Yes, cached queue with offline indicator
- **Swipe gestures**: Claim/pause without opening card
- **Auto-route**: Tapping task navigates to type-specific screen (MOB-005 for inbound, MOB-009 for pick, etc.)
