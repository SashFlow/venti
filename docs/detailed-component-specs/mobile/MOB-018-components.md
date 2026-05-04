# MOB-018: Recount and Variance Note - Component Specification

## Screen Reference
- **ID**: MOB-018 | **Name**: Recount and Variance Note
- **Base Spec**: `../../mobile-screen-specs/MOB-018 Recount and Variance Note.md`
- **Deep Link**: `venti://count/recount/:caseId`

## Component Inventory
**Primary**: 1. Variance Summary, 2. Recount Input, 3. Reason/Evidence Panel, 4. Submit Button
**Secondary**: 5. Threshold Guidance, 6. Financial Impact, 7. Supervisor Review Request
**Modals**: Photo Capture, Supervisor Escalation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| originalCount | number | First count |
| recountQty | number | Second count |
| varianceAmount | number | Calculated |
| variancePercent | number | Percentage |
| reasonCode | enum | Predefined reasons |
| evidence | array | Photos/notes |
| requiresSupervisor | boolean | Auto-flagged |

## Layout
**Header**: Variance case summary
**Comparison**: Original vs recount (side-by-side)
**Reason**: Dropdown + text area
**Footer**: Submit button

## Key Components
- **Variance Panel**: Shows original count, recount, difference, percentage in large text
- **Recount Input**: Large numpad entry, requires second count
- **Reason Selector**: Dropdown of common reasons (Miscount, Bin Mislabeled, Shrinkage, System Error)
- **Evidence Panel**: Photo capture + note text area (multi-line, 120px)
- **Threshold Indicator**: Shows variance threshold (e.g., "10% threshold" with color coding)
- **Financial Impact**: Optional display of variance cost (if high-value SKU)
- **Supervisor Flag**: Auto-appears if variance exceeds approval threshold
- **Escalation Button**: Request supervisor review before submitting

## Mobile-Specific
- **Gloves-friendly**: Yes, inputs 80px
- **Offline**: Partial (can capture, queues submission)
- **Photo Capture**: Quick camera access
- **Escalation Path**: Clear when supervisor approval needed
