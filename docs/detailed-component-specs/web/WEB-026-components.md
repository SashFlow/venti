# WEB-026: Exception Command Center - Component Specification

## Screen Reference
- **ID**: WEB-026 | **Name**: Exception Command Center
- **Base Spec**: `../../web-screen-specs/WEB-026 Exception Command Center.md`
- **Route**: `/workspace/:workspaceId/exceptions`

## Component Inventory
**Primary**: 1. Exception Queue by Severity, 2. Owner Assignment, 3. Corrective Action Tracker
**Secondary**: 4. Source Trends, 5. Open vs Resolved Aging, 6. Repeat Indicators
**Modals**: Assign Owner Modal, Add Action Modal, Exception Detail Drawer

## Data Schema
| Field | Type |
|-------|------|
| exceptionId | string |
| type | enum |
| severity | enum |
| source | string |
| owner | string |
| age | number |
| isRecurring | boolean |
| correctiveActions | array |

## Layout
**Pattern**: Exception table + trend charts
**Table**: Left 70%, queue by severity
**Charts**: Right 30%, trend analysis

## Key Components
- **Exception Queue**: Columns: ID, Type, Severity, Source, Owner, Age, Recurring, SLA, Actions
- **Severity Tabs**: Filter by Critical/High/Medium/Low with count badges
- **Type Filter**: Inventory, Order, Quality, System exceptions
- **Owner Assignment**: Dropdown to assign exception owner, shows avatar when assigned
- **Age**: Days open, color-coded (red >7d, yellow >3d, green <3d)
- **Recurring Badge**: Orange "⟳ Recurring" badge if exception repeats
- **Corrective Actions**: Expandable list per exception (Action, Owner, Due Date, Status)
- **Add Action**: Button to add corrective action with deadline
- **Source Trends**: Chart showing exception sources over time
- **Open vs Resolved**: Line chart showing open/resolved trends
- **Repeat Indicator**: Flags exceptions that occur frequently (>3 times in 30d)
- **Triage Button**: Quickly assign severity/owner for new exceptions
- **Detail Drawer**: Opens on click, shows full history, linked entities, action plan

## Web-Specific
- **Trend Analysis**: Visual charts for exception patterns
- **Bulk Triage**: Multi-select for batch assignment
- **Recurring Detection**: Automated identification of repeating exceptions
- **Action Tracking**: Complete corrective action management
