# WEB-002: Task Orchestration Board - Component Specification

## Screen Reference
- **ID**: WEB-002 | **Name**: Task Orchestration Board
- **Base Spec**: `../../web-screen-specs/WEB-002 Task Orchestration Board.md`
- **Route**: `/workspace/:workspaceId/tasks/orchestration`

## Component Inventory
**Primary**: 1. Kanban Board, 2. Task Cards, 3. Stage Columns, 4. Bulk Action Toolbar
**Secondary**: 5. Priority Badges, 6. SLA Timers, 7. Owner Avatars, 8. Dependency Indicators
**Modals**: Task Detail Drawer, Bulk Reassign Modal, Priority Change Dialog

## Data Schema
| Field | Type | Description |
|-------|------|-------------|
| taskId | string | Task UUID |
| stage | enum | 'pending','in_progress','blocked','completed' |
| priority | enum | 'critical','high','normal','low' |
| assignedTo | string | User ID |
| slaDeadline | datetime | Deadline |
| dependencies | array | Blocking task IDs |

## Layout
**Pattern**: Kanban board (horizontal columns)
**Columns**: 4 stages (Pending, In Progress, Blocked, Completed)
**Card**: 120px height, drag-droppable
**Bulk Toolbar**: Sticky at top when cards selected

## Key Components
- **Stage Columns**: 4 vertical swimlanes with count badges
- **Task Card**: Task type icon + title + priority badge + SLA countdown + owner avatar + dependency blocker icon (if any)
- **Drag-Drop**: Cards draggable between stages
- **Bulk Select**: Checkbox selection on hover, multi-select with Shift
- **Bulk Toolbar**: Appears when 1+ selected: Reassign Owner, Change Priority, Pause All, Unblock
- **SLA Timer**: Color-coded (red <15min, yellow <1hr, green >1hr)
- **Dependency Badge**: Orange "⊗ Blocked by X tasks" indicator
- **Owner Avatar**: Profile photo or initials
- **Priority Badge**: Color-coded chip (red=critical, orange=high, blue=normal, gray=low)
- **Filters**: Filter by task type, priority, owner, warehouse

## Web-Specific
- **Drag-Drop**: Smooth drag-drop UX with column highlighting
- **Bulk Actions**: Multi-select for batch operations
- **Real-Time**: Tasks auto-update when status changes
- **Responsive**: Stacks columns vertically on small screens
