# 1. Screen Overview
Screen ID: MOB-009
Name: Pick Execution by Scan
Primary Persona: Floor Operator

Goal of Screen (1 line): Execute each pick line using scan-first validation and quantity confirmation.

What should the user accomplish here?
- Pick the correct SKU/lot from the correct bin and confirm quantity quickly.

# 2. Primary Action (Critical)
Main CTA: Confirm Pick Line
Success condition: Bin/SKU/qty validation passes and line is posted.
What happens after success:
- Next pick line auto-loads; complete wave returns summary.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Required qty, current line SKU, bin, Confirm CTA
🟡 Secondary (visible but less prominent)
- Picked qty, short qty, FEFO suggestion
⚪ Tertiary (hidden / expandable)
- Substitute list, historical errors

# 4. Layout Structure (Wireframe in words)
Header: Wave + progress meter
Body: Step sequence (scan bin -> scan SKU -> qty)
Footer / Sticky CTA: Confirm Pick Line
Floating elements: Substitute picker and short-pick shortcut

# 5. Interaction Model
Tap actions: Enter qty, choose substitute, confirm
Swipe actions: Mark line as short-pick
Scan behavior: Enforced order: bin first, SKU second
Auto-navigation rules: Valid line auto-advances

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Line context skeleton |
| Empty | No lines remaining + finish summary |
| Error | Immediate inline error + red highlight |
| Success | Green flash + advance |

# 7. Error Handling (Important for ops apps)
Error type: Wrong bin
User feedback: Red banner + loud beep
Recovery action: Rescan correct bin

Error type: Expired lot selected
User feedback: Blocking modal
Recovery action: Select FEFO-compliant lot

# 8. Visual Priority & Cues
- Red: invalid scan/hard block
- Yellow: short quantity warning
- Green: line confirmed
- Blue: active step guidance
- Badge usage: FEFO required, substitute used
- Icon expectations: barcode, bin, quantity

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 3 per line
Offline support: Yes (queue with conflict resolution)
Latency tolerance: < 250ms scan feedback

# 10. Device / Hardware Context
Scanner type: Hardware preferred
Gloves usage: Yes
Sound feedback: Yes (distinct pass/fail)
Vibration: Yes on failures

# 11. Navigation Rules
Entry point: MOB-008
Exit path: MOB-010 (if short) or next line
Back behavior: Warn before abandoning active line
Deep links (if any): Exception deep link to line ID

# 12. Edge Cases
- Insufficient stock at scanned bin
- Substitute allowed only for subset of orders
- Duplicate line scan in batch pick

# 13. Notes for Designer (Optional but powerful)
- Scanner-first UX
- Step-by-step guidance must be unmistakable
- Keep quantity and bin text large
