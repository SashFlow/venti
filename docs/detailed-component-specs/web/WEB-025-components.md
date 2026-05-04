# WEB-025: Approval Inbox - Component Specification

## Screen Reference
- **ID**: WEB-025 | **Name**: Approval Inbox
- **Base Spec**: `../../web-screen-specs/WEB-025 Approval Inbox.md`
- **Route**: `/workspace/:workspaceId/approvals/inbox`

## Component Inventory
**Primary**: 1. Request Queue Table, 2. Context Drawer, 3. Approve/Reject/Delegate Actions, 4. Comment Form
**Secondary**: 5. Risk Scores, 6. Financial/Operational Impact, 7. SLA Deadline, 8. Escalation
**Modals**: Approval Context Drawer, Rejection Reason Dialog, Delegation Modal

## Data Schema
| Field | Type |
|-------|------|
| requestId | string |
| type | enum |
| requestor | string |
| riskScore | number |
| financialImpact | number |
| slaDeadline | datetime |
| status | enum |

## Layout
**Pattern**: Inbox table + detail drawer
**Table**: 70px rows, left 60%
**Drawer**: Right 40%, opens on row click

## Key Components
- **Approval Queue**: Columns: Request ID, Type, Requestor, Risk Score, Impact, SLA, Status, Actions
- **Request Type**: PO Approval, Transfer Approval, Write-Off, Override, etc. with icons
- **Risk Score**: 0-100 with color coding (green <30, yellow 30-70, red >70)
- **Financial Impact**: Dollar amount if applicable
- **Operational Impact**: Badge (High, Medium, Low)
- **SLA Deadline**: Color-coded countdown (red <2hr, yellow <8hr, green >8hr)
- **Context Drawer**: Opens on row click, shows full request details, justification, attachments
- **Approve Button**: Green primary button, requires confirmation if high-risk
- **Reject Button**: Red secondary button, opens reason dialog
- **Delegate Button**: Reassigns to another approver
- **Comment Form**: Text area for approval notes/conditions
- **Escalation Badge**: Shows if escalated from previous approver

## Web-Specific
- **Unified Inbox**: All approval types in one queue
- **Risk Assessment**: Automated risk scoring for decision support
- **SLA Tracking**: Real-time SLA countdown
- **Bulk Actions**: Multi-select for batch approval (low-risk only)
