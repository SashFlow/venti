# MOB-010: Short Pick Exception - Component Specification

## Screen Reference
- **ID**: MOB-010 | **Name**: Short Pick Exception
- **Base Spec**: `../../mobile-screen-specs/MOB-010 Short Pick Exception.md`
- **Deep Link**: `venti://pick/short/:taskId`

## Component Inventory
**Primary**: 1. Shortage Comparison Panel, 2. Reason Selector, 3. Alternate Bin Suggestions, 4. Confirm Exception Button
**Secondary**: 5. Order Impact Display, 6. Escalate to Supervisor Button
**Modals**: Alternate Bin Picker, Order Impact Details

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| requiredQty | number | Original requirement |
| availableQty | number | Actually available |
| shortQty | number | Difference |
| reasonCode | enum | 'bin_empty','damaged','miscount','location_error' |
| alternateBin | string | Optional alternate location |

## Layout
**Pattern**: Problem summary → Reason → Resolution
**Comparison**: Top card, 100px height
**Reasons**: Radio list, 60px per item
**Footer**: Action buttons

## Key Components
- **Shortage Panel**: Shows required vs available with visual diff (red highlight on short qty)
- **Reason Selector**: Radio list of common reasons (Bin Empty, Damaged Stock, Count Error, Wrong Location)
- **Alternate Bins**: If stock exists elsewhere, shows list of bins with available qty + distance
- **Order Impact**: Expandable panel showing which orders will be affected by shortage
- **Escalate Button**: Opens supervisor notification with context
- **Confirm Button**: Records exception, returns to pick list or completes wave

## Mobile-Specific
- **Gloves-friendly**: Yes, radio buttons 60px height
- **Offline**: Yes, exception queued
- **Scanner Option**: Can scan alternate bin to verify stock there
- **Impact Visibility**: Shows critical orders first (SLA breach risk)
