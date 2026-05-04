# ADM-010: Role and Permission Manager - Component Specification

## Screen Reference
- **ID**: ADM-010 | **Name**: Role and Permission Manager
- **Base Spec**: `../../admin-screen-specs/ADM-010 Role and Permission Manager.md`
- **Route**: `/admin/roles-permissions`

## Component Inventory
**Primary**: 1. Role List, 2. Permission Grid, 3. Role Form, 4. Inheritance Viewer
**Secondary**: 5. Scope Restrictions, 6. Warehouse-Level Permissions, 7. Permission Groups
**Modals**: Create Role Modal, Permission Details, Copy Role Dialog

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| roleId | string | UUID |
| roleName | string | Required, unique |
| inheritsFrom | string | Parent role ID |
| permissions | array | Permission codes |
| scope | object | Warehouse restrictions |

## Layout
**Pattern**: Role list left (30%) + permission grid center (50%) + details right (20%)
**Grid**: Rows = permissions, Columns = roles, Cells = checkboxes

## Key Components
- **Role List**: Name, Description, User Count, Inherits From, Status
- **Permission Grid**: Matrix view with permission groups (rows) and roles (columns)
- **Permission Groups**: Collapsible sections (Inbound, Outbound, Inventory, Admin, Reports)
- **Checkboxes**: Read/Write/Delete per permission (tri-state for inheritance)
- **Role Form**: Name, description, parent role dropdown
- **Inheritance Viewer**: Shows inherited permissions in gray (non-editable)
- **Scope Restrictions**: Multi-select warehouses (restrict role to specific warehouses)
- **Warehouse Selector**: Checkboxes for warehouse-scoped permissions
- **Copy Role**: Button to duplicate role with new name
- **Bulk Edit**: Multi-select permissions for batch enable/disable

## Admin-Specific
- **Permission Matrix**: Visual grid of all permissions across roles
- **Role Inheritance**: Parent-child role hierarchy with inherited permissions
- **Warehouse Scoping**: Restrict permissions to specific warehouses
- **Tri-State Checkboxes**: Inherited (gray), Enabled (checked), Disabled (unchecked)
