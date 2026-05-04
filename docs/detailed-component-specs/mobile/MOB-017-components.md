# MOB-017: Cycle Count Entry - Component Specification

## Screen Reference
- **ID**: MOB-017 | **Name**: Cycle Count Entry
- **Base Spec**: `../../mobile-screen-specs/MOB-017 Cycle Count Entry.md`
- **Deep Link**: `venti://count/:routeId`

## Component Inventory
**Primary**: 1. Bin Display, 2. SKU List, 3. Count Input, 4. Save Count Button
**Secondary**: 5. Variance Panel, 6. Note/Photo Shortcuts, 7. Last Count Time, 8. Next/Previous Navigation
**Modals**: Variance Threshold Warning, Photo Capture

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| binLocation | string | Scanned bin |
| sku | string | Per line |
| systemQty | number | Expected count |
| countedQty | number | Actual count |
| variance | number | Calculated diff |
| note | string | Optional comment |
| photos | array | Optional evidence |

## Layout
**Header**: Bin location + progress
**SKU List**: Scrollable, 80px per SKU
**Count Input**: Inline per SKU, large numpad
**Footer**: Save + Next buttons

## Key Components
- **Bin Header**: Large bin code, scan to bind/verify
- **SKU Line**: SKU code + description + system qty + count input (80px height)
- **Count Input**: Numpad keyboard, auto-focus, shows system qty for reference
- **Variance Indicator**: Real-time variance calculation, color-coded (green match, yellow minor, red major)
- **System Qty Display**: Shows expected count, helps operator validate
- **Note Icon**: Quick add note per SKU or bin
- **Photo Icon**: Quick capture photo evidence (damaged items, empty bin, etc.)
- **Last Count**: Shows when bin was last counted
- **Navigation**: Previous/Next bin buttons for sequential counting

## Mobile-Specific
- **Gloves-friendly**: Yes, input 80px height, large numpad keys
- **Offline**: Yes, fully supported
- **Scanner**: Scan bin to lock, scan SKU to jump to line
- **Sound**: Beep on variance beyond threshold
- **Variance Signals**: Immediate visual feedback (red highlight >10% variance)
