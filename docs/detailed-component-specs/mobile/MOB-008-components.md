# MOB-008: Pick Task List - Component Specification

## Screen Reference
- **ID**: MOB-008 | **Name**: Pick Task List
- **Base Spec**: `../../mobile-screen-specs/MOB-008 Pick Task List.md`
- **Deep Link**: `venti://tasks/picking`

## Component Inventory
**Primary**: 1. Wave Cards, 2. Route Estimate Badge, 3. Start Wave Button
**Secondary**: 4. Line Count, 5. SLA Timer, 6. Reassignment Option
**Modals**: Wave Details Drawer, Reassign Wave Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| waveId | string | WAVE-#### |
| lineCount | number | Pending pick lines |
| estimatedTime | number | Minutes |
| slaDeadline | datetime | ISO format |
| routeOptimized | boolean | Route calculation complete |

## Layout
**Pattern**: Vertical list of wave cards
**Card**: 140px height, shows key wave info
**SLA**: Always visible in header or per card

## Key Components
- **Wave Card**: Wave ID + order count + line count + route estimate + SLA timer + Start button
- **Route Badge**: "Route Optimized" or "Sequential" indicator
- **SLA Countdown**: Real-time countdown, color-coded urgency
- **Start Button**: Per-wave, opens pick execution (MOB-009)
- **Reassign Link**: Allows reassigning wave to another picker if available

## Mobile-Specific
- **Gloves-friendly**: Yes, card height 140px
- **Offline**: Partial (cached waves, can't start new without network)
- **Route Display**: Shows estimated walk distance/time
- **Scanner**: Can scan wave label to jump to specific wave
