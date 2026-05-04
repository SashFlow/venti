# WEB-008: Packing Station Workbench - Component Specification

## Screen Reference
- **ID**: WEB-008 | **Name**: Packing Station Workbench
- **Base Spec**: `../../web-screen-specs/WEB-008 Packing Station Workbench.md`
- **Route**: `/workspace/:workspaceId/packing/workbench`

## Component Inventory
**Primary**: 1. Tote/Order Queue, 2. Picked Items Checklist, 3. Label Print Control, 4. Complete Pack Button
**Secondary**: 5. Carton Recommendations, 6. Weight Input, 7. Dimensional Input
**Modals**: Open Tote Modal, Print Label Dialog, Weight/Dimension Editor

## Data Schema
| Field | Type |
|-------|------|
| toteId | string |
| orderId | string |
| items | array |
| cartonType | string |
| weight | number |
| dimensions | object |

## Layout
**Pattern**: Queue list left (30%) + active packing center (70%)
**Checklist**: Item list with checkboxes
**Controls**: Bottom action bar

## Key Components
- **Queue List**: Totes waiting to pack, priority sorted
- **Active Tote**: Large display of current tote/order being packed
- **Item Checklist**: Items with checkboxes (All items, Verify SKU, Verify qty, Check quality)
- **Carton Recommender**: Suggests optimal carton size based on items
- **Weight Input**: Scale integration or manual entry
- **Dimensions**: L x W x H inputs with validation
- **Label Print**: Print button with printer selector, reprint option
- **Complete Button**: Finalizes pack, generates shipment

## Web-Specific
- **Queue Management**: Auto-advance to next tote
- **Scale Integration**: Direct weight reading from device
- **Label Auto-Print**: Option to auto-print on complete
