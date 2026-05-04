# ADM-011: User and Team Administration - Component Specification

## Screen Reference
- **ID**: ADM-011 | **Name**: User and Team Administration
- **Base Spec**: `../../admin-screen-specs/ADM-011 User and Team Administration.md`
- **Route**: `/admin/users-teams`

## Component Inventory
**Primary**: 1. User Table, 2. User Form, 3. Team Manager, 4. Account Lifecycle Controls
**Secondary**: 5. Role Assignment, 6. Invitation System, 7. MFA State Display, 8. Activity Tracking
**Modals**: Invite User Modal, Edit User Modal, Suspend Confirmation, Team Editor

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| userId | string | UUID |
| email | string | Email format, unique |
| status | enum | 'active','suspended','invited' |
| roles | array | Role IDs |
| teams | array | Team IDs |
| mfaEnabled | boolean | Security flag |
| lastLogin | datetime | ISO format |

## Layout
**Pattern**: User table with inline actions, detail panel
**Table**: 70px rows, user list
**Panel**: Right drawer with user details

## Key Components
- **User Table**: Name, Email, Status chip, Roles, Teams, MFA badge, Last Login, Actions
- **Status Chip**: Active (green), Suspended (red), Invited (yellow)
- **Invite User**: Button opens modal with email, role, team, warehouse selection
- **User Form**: Name, email, title, phone, warehouse assignment
- **Role Assignment**: Multi-select dropdown of roles
- **Team Assignment**: Multi-select dropdown of teams
- **MFA Badge**: Green checkmark if enabled, gray X if disabled
- **Account Lifecycle**: Buttons for Suspend, Reactivate, Reset Password, Revoke Sessions
- **Invitation Resend**: Button to resend invitation email
- **Activity Tracking**: Last login, last action, session count
- **Team Manager**: Create/edit teams, assign team members
- **Bulk Actions**: Multi-select for batch role assignment, suspension

## Admin-Specific
- **Account Lifecycle**: Invite/suspend/reactivate user workflows
- **Role/Team Assignment**: Multi-select assignment to roles and teams
- **MFA Management**: View MFA status, reset if needed
- **Activity Monitoring**: Track user login and activity patterns
