# ADM-005: UOM and Conversion Admin - Component Specification

## Screen Reference
- **ID**: ADM-005 | **Name**: UOM and Conversion Admin
- **Base Spec**: `../../admin-screen-specs/ADM-005 UOM and Conversion Admin.md`
- **Route**: `/admin/uom-conversion`

## Component Inventory
**Primary**: 1. UOM Table, 2. UOM Form, 3. Conversion Matrix, 4. Hierarchy Builder
**Secondary**: 5. Precision/Rounding Config, 6. Effective Date Scheduler, 7. Base UOM Selector
**Modals**: Create UOM Modal, Conversion Editor, Matrix Preview

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| uomCode | string | Unique, required |
| description | string | Max 100 chars |
| baseUOM | string | FK to base UOM |
| conversionFactor | number | > 0, precision |
| effectiveDate | date | Future dates allowed |

## Layout
**Pattern**: UOM list left (30%) + matrix center (50%) + config right (20%)
**Matrix**: Grid showing conversion factors between UOMs

## Key Components
- **UOM Table**: Code, Description, Type (Each/Case/Pallet), Base UOM, Status
- **UOM Form**: Code, description, type, decimal precision (0-4 places)
- **Hierarchy Builder**: Tree showing UOM relationships (Each → Case → Pallet)
- **Conversion Matrix**: Grid with UOM rows/columns, cells show conversion factors
- **Factor Editor**: Input conversion factor (e.g., 1 Case = 12 Each)
- **Precision Config**: Decimal places for qty calculations
- **Rounding Rules**: Dropdown (Round Up, Round Down, Round Nearest, No Rounding)
- **Effective Date**: Date picker for scheduled conversions (price changes, etc.)
- **Base/Alternate**: Radio for base UOM per SKU, alternates for transactions

## Admin-Specific
- **Conversion Matrix**: Visual grid of all UOM conversions
- **Hierarchy Management**: Parent-child UOM relationships
- **Precision Control**: Configurable decimal precision
- **Scheduled Changes**: Effective date support for future conversions
