# ADM-002: Zone Shelf Bin Designer - Component Specification

## Screen Reference
- **ID**: ADM-002 | **Name**: Zone Shelf Bin Designer
- **Base Spec**: `../../admin-screen-specs/ADM-002 Zone Shelf Bin Designer.md`
- **Route**: `/admin/location-designer`

## Component Inventory
**Primary**: 1. Tree Hierarchy Viewer, 2. Canvas Editor, 3. Node Config Form, 4. Bulk Import
**Secondary**: 5. Capacity Display, 6. Location Code Generator, 7. Node Actions
**Modals**: Add Node Modal, Bulk Import Dialog, Capacity Editor

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| locationId | string | Unique code |
| parentId | string | FK to parent |
| type | enum | 'zone','aisle','shelf','bin' |
| capacity | object | Dimensions, weight, units |

## Layout
**Pattern**: Tree left (30%) + canvas center (50%) + properties right (20%)
**Tree**: Expandable hierarchy with drag-drop
**Canvas**: Visual representation of warehouse layout

## Key Components
- **Tree Viewer**: 4-level hierarchy (Zone → Aisle → Shelf → Bin) with expand/collapse
- **Node Display**: Location code + capacity indicator + action menu
- **Canvas**: Visual warehouse map, drag-drop nodes
- **Capacity Config**: Length/width/height + weight + unit count inputs
- **Bulk Import**: CSV upload with location hierarchy, validates parent relationships
- **Code Generator**: Auto-generates codes (Z01-A01-S01-B01 pattern)
- **Add Node**: Modal with parent selector, type dropdown, code input
- **Node Actions**: Add Child, Edit, Delete, Duplicate, Move

## Admin-Specific
- **Tree Visualization**: Hierarchical location structure editor
- **Bulk Operations**: Import/export location hierarchy
- **Code Generation**: Automated location code patterns
- **Capacity Management**: Per-location capacity configuration
