# MOB-007: Putaway Suggestion and Confirm - Component Specification

## Screen Reference
- **ID**: MOB-007 | **Name**: Putaway Suggestion and Confirm
- **Base Spec**: `../../mobile-screen-specs/MOB-007 Putaway Suggestion and Confirm.md`
- **Deep Link**: `venti://putaway/:taskId`

## Component Inventory
**Primary**: 1. Suggested Bin Card, 2. Bin Scan Confirmation, 3. Confirm Putaway Button
**Secondary**: 4. Alternate Bin Picker, 5. Capacity Indicator, 6. Distance/Route Hint
**Modals**: Bin Full Warning, Alternate Bin Selection Drawer

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| suggestedBin | string | Bin location code |
| actualBin | string | Scanned bin |
| binCapacity | number | Percentage 0-100 |
| binOccupancy | number | Current items |
| distance | number | Meters from current location |

## Layout
**Pattern**: Suggestion → Scan → Confirm
**Suggested Bin**: Prominent display, top 50% of screen
**Scan Area**: Middle, large scan prompt
**Alternates**: Bottom sheet drawer (swipe up to view)

## Key Components
- **Suggested Bin Card**: Large bin code (72px font), zone/aisle info, capacity bar, distance estimate
- **Scan Confirmation**: "Scan suggested bin to confirm" prompt, green check on match, red X on mismatch
- **Capacity Bar**: Visual fill indicator (green <70%, yellow 70-90%, red >90%)
- **Alternate Button**: Shows count of alternates, opens bottom sheet with list
- **Alternate Picker**: List of 3-5 alternate bins with capacity/distance, tap to select
- **Confirm Button**: Disabled until valid bin scanned, 60px height, green

## Mobile-Specific
- **Scanner-first**: Yes, enforced bin scan validation
- **Gloves-friendly**: Yes, bin code large, buttons 60px
- **Offline**: Yes, queued putaway with sync
- **Route Hint**: Shows walking distance, direction arrow (if location services enabled)
- **Mismatch Handling**: If wrong bin scanned, offers "Use This Bin" with reason code OR "Rescan Correct Bin"
