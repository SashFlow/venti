# ADM-009: Approval Matrix Configuration - Component Specification

## Screen Reference
- **ID**: ADM-009 | **Name**: Approval Matrix Configuration
- **Base Spec**: `../../admin-screen-specs/ADM-009 Approval Matrix Configuration.md`
- **Route**: `/admin/approval-matrix`

## Component Inventory
**Primary**: 1. Permission Matrix, 2. Threshold Rules, 3. Escalation Paths, 4. Delegation Setup
**Secondary**: 5. SLA Config, 6. Approver Mapping, 7. Test Simulator
**Modals**: Add Rule Modal, Escalation Editor, Test Approval Flow

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| ruleId | string | UUID |
| entityType | enum | 'PO','TO','WriteOff','Override' |
| thresholdField | string | 'value','qty','variance%' |
| thresholdValue | number | Numeric |
| approverRole | string | Role ID |
| escalationSLA | number | Hours |

## Layout
**Pattern**: Entity type tabs + matrix table + escalation panel
**Matrix**: Rows = threshold ranges, Columns = approvers
**Panel**: Right side escalation path builder

## Key Components
- **Entity Type Tabs**: PO Approval, Transfer Approval, Write-Off, Override, etc.
- **Approval Matrix**: Grid showing threshold ranges vs approver roles
  - Example: PO <$1K → Supervisor, $1K-$10K → Manager, >$10K → Director
- **Threshold Rules**: Define ranges with operators (<, >, between)
- **Approver Role**: Dropdown selecting role required for approval
- **Delegation Setup**: Checkbox to allow approver delegation, select delegates
- **SLA Config**: Hours until escalation (e.g., 4 hours, 24 hours)
- **Escalation Path**: If SLA missed → escalate to next level (Manager → Director)
- **Parallel Approval**: Checkbox for multiple approvers (all must approve)
- **Auto-Approve**: Checkbox for rules that auto-approve below threshold
- **Test Simulator**: Input entity + amount, shows approval path + approvers + SLA

## Admin-Specific
- **Permission Matrix**: Visual grid of approval rules
- **Threshold-Based**: Value/qty/% based approval routing
- **Escalation Paths**: Multi-level escalation with SLA tracking
- **Test Mode**: Simulate approval flows before deployment
