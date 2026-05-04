# WEB-016: Replenishment Recommendations - Component Specification

## Screen Reference
- **ID**: WEB-016 | **Name**: Replenishment Recommendations
- **Base Spec**: `../../web-screen-specs/WEB-016 Replenishment Recommendations.md`
- **Route**: `/workspace/:workspaceId/replenishment/recommendations`

## Component Inventory
**Primary**: 1. Proposal Grid, 2. Quantity Adjuster, 3. Approve/Create Actions
**Secondary**: 4. Forecast Window, 5. Safety Stock, 6. Lead Time, 7. Stockout Risk Date
**Modals**: Adjust Quantity Modal, Create PO Dialog, Transfer Dialog

## Data Schema
| Field | Type |
|-------|------|
| sku | string |
| currentStock | number |
| recommendedQty | number |
| safetyStock | number |
| leadTimeDays | number |
| stockoutDate | date |
| action | enum |

## Layout
**Pattern**: Table with adjustment controls
**Table**: 70px rows, editable qty column
**Toolbar**: Bulk approve/create buttons

## Key Components
- **Proposal Table**: Columns: SKU, Current Stock, Recommended Qty, Safety Stock, Lead Time, Stockout Risk, Action, Adjust
- **Action Column**: Buy (PO), Transfer, Both dropdown
- **Quantity Adjuster**: Inline input with +/- buttons, shows recommended qty
- **Stockout Risk**: Date when stockout expected, red if <7d, yellow if <30d
- **Forecast Window**: Shows demand forecast for next 30/60/90 days
- **Safety Stock**: Configurable minimum level
- **Lead Time**: Supplier or transfer lead time display
- **Approve Button**: Per row or bulk, creates PO/TO based on action
- **Adjust Modal**: Shows demand forecast chart, allows qty override with justification
- **Create PO/TO**: Opens creation dialog with pre-filled details

## Web-Specific
- **Forecast Visualization**: Demand forecast charts per SKU
- **Bulk Approval**: Multi-select for batch PO/TO creation
- **Quantity Adjustment**: Inline editing with justification
