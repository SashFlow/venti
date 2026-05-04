# MOB-016: Cycle Count Task List - Component Specification

## Screen Reference
- **ID**: MOB-016 | **Name**: Cycle Count Task List
- **Base Spec**: `../../mobile-screen-specs/MOB-016 Cycle Count Task List.md`
- **Deep Link**: `venti://tasks/cycle-count`

## Component Inventory
**Primary**: 1. Route Cards, 2. Frozen-Bin Toggle, 3. Start Count Button
**Secondary**: 4. Recount Badges, 5. Due Time, 6. Count Class Context, 7. Skip Button
**Modals**: Route Details, Skip Reason Input

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| routeId | string | Route ID |
| binCount | number | Bins in route |
| countClass | enum | 'A','B','C','D' |
| dueDate | datetime | Deadline |
| binsRecountRequired | number | Recount flags |

## Layout
**Pattern**: Route cards, vertical list
**Card**: 120px height, shows route summary
**Frozen Toggle**: Per-route or global setting

## Key Components
- **Route Card**: Route ID + zone + bin count + count class badge + due time + Start button
- **Frozen Status**: Icon indicator if bins are frozen (inventory locked)
- **Recount Badge**: Shows count of bins requiring recount (red badge)
- **Count Class**: A (high-value, frequent) to D (low-value, infrequent) visual coding
- **Historical Accuracy**: Per-zone accuracy percentage from past counts
- **Skip Option**: Skip route with reason code (requires approval for A-class)

## Mobile-Specific
- **Gloves-friendly**: Yes, card height 120px
- **Offline**: Yes, cached routes
- **Scanner**: Can scan route label to jump
- **Freeze Indicator**: Clear visual for frozen inventory status
