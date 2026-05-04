# ADM-001: Tenant and Warehouse Setup - Component Specification

## Screen Reference
- **ID**: ADM-001 | **Name**: Tenant and Warehouse Setup
- **Base Spec**: `../../admin-screen-specs/ADM-001 Tenant and Warehouse Setup.md`
- **Route**: `/admin/tenant-setup`

## Component Inventory
**Primary**: 1. Tenant Config Form, 2. Warehouse Config Form, 3. Operating Calendar, 4. Impact Preview Panel
**Secondary**: 5. Timezone/Localization Settings, 6. Version History, 7. Validation Panel
**Modals**: Impact Preview Dialog, Version Compare, Publish Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| tenantName | string | Required, unique |
| warehouseName | string | Required |
| timezone | string | IANA timezone |
| operatingHours | object | Start/end times |
| locale | string | ISO locale code |

## Layout
**Pattern**: Multi-tab form (Tenant/Warehouses/Calendar)
**Forms**: Left 60%, preview/impact right 40%
**Footer**: Save Draft / Publish buttons

## Key Components
- **Tenant Form**: Name, code, legal entity, admin contact
- **Warehouse Form**: Name, code, address, type, capacity
- **Operating Calendar**: Weekly schedule with shift patterns
- **Timezone Selector**: Dropdown with search, shows current time
- **Locale Settings**: Language, currency, date/time formats
- **Impact Preview**: Shows affected integrations/workflows
- **Version History**: Timeline of config changes
- **Validation Panel**: Blocking/warning validation messages
- **Publish Button**: Commits config, shows confirmation modal

## Admin-Specific
- **Draft/Publish State**: Draft mode with publish workflow
- **Impact Analysis**: Shows downstream effects before publish
- **Version Control**: Full change history with diffs
- **Validation**: Inline + summary panel with conflict detection
