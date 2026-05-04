# ADM-003: Capacity and Restriction Rules - Component Specification

## Screen Reference
- **ID**: ADM-003 | **Name**: Capacity and Restriction Rules
- **Base Spec**: `../../admin-screen-specs/ADM-003 Capacity and Restriction Rules.md`
- **Route**: `/admin/capacity-rules`

## Component Inventory
**Primary**: 1. Rule Table, 2. Rule Builder Form, 3. Priority Ordering, 4. Impact Preview
**Secondary**: 5. Incompatibility Matrix, 6. Overflow Behavior Config, 7. Test Simulator
**Modals**: Create Rule Modal, Test Simulation Dialog, Conflict Resolution

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| ruleId | string | UUID |
| ruleName | string | Required |
| priority | number | Unique ordering |
| conditions | object | Location/SKU/state filters |
| restrictions | object | Capacity/compatibility rules |

## Layout
**Pattern**: Rule list left (40%) + rule editor right (60%)
**Table**: Priority-sorted rules with drag handles
**Editor**: Multi-section form

## Key Components
- **Rule Table**: Name, Priority (drag-drop reorder), Conditions, Status, Actions
- **Priority Drag-Drop**: Reorder rules by dragging (higher priority first)
- **Rule Builder**: Condition builder (IF location=Zone A AND SKU category=Chemicals)
- **Restriction Editor**: Max weight, max volume, max units, incompatible stock types
- **Incompatibility Matrix**: Grid showing incompatible SKU combinations (Chemicals ⊗ Food)
- **Overflow Behavior**: Dropdown (Block, Warn, Auto-Suggest Alternate)
- **Impact Preview**: Shows affected bins/SKUs before publish
- **Test Simulator**: Input location + SKU, shows which rules apply
- **Validation**: Checks for conflicting rules, highlights priority issues

## Admin-Specific
- **Rule Priority**: Visual drag-drop priority ordering
- **Impact Analysis**: Shows bins affected by rule changes
- **Test Mode**: Simulate rules before deployment
- **Conflict Detection**: Warns about overlapping/conflicting rules
