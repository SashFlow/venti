# 1. Screen Overview
Screen ID: MOB-013
Name: Bin-to-Bin Transfer Execute
Primary Persona: Floor Operator

Goal of Screen (1 line): Move stock between bins with validated source, quantity, and destination.

What should the user accomplish here?
- Complete an internal transfer accurately with reason capture.

# 2. Primary Action (Critical)
Main CTA: Confirm Transfer
Success condition: Source/destination scans validated and movement posted.
What happens after success:
- Inventory balances update and audit event recorded.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Source bin, destination bin, qty, Confirm CTA
🟡 Secondary (visible but less prominent)
- Available quantity, destination capacity, reason code
⚪ Tertiary (hidden / expandable)
- Previous movements and notes

# 4. Layout Structure (Wireframe in words)
Header: Transfer type and task ID
Body: Step form (source scan -> qty -> destination scan)
Footer / Sticky CTA: Confirm Transfer
Floating elements: Reason code quick picker

# 5. Interaction Model
Tap actions: Enter qty, select reason, confirm
Swipe actions: None
Scan behavior: Source first, destination second with strict validation
Auto-navigation rules: Success returns to queue or next transfer line

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Form skeleton |
| Empty | No transfer lines message |
| Error | Inline validation on scan mismatch |
| Success | Green success banner |

# 7. Error Handling (Important for ops apps)
Error type: Insufficient source stock
User feedback: Red inline stock error
Recovery action: Adjust qty or choose different source

Error type: Destination restricted
User feedback: Blocking modal
Recovery action: Pick compliant destination

# 8. Visual Priority & Cues
- Red: hard rule violation
- Yellow: near-capacity warning
- Green: transfer complete
- Blue: step actions
- Badge usage: restricted zone, high priority move
- Icon expectations: move arrows, bin, quantity

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 3
Offline support: Yes
Latency tolerance: < 300ms validation feedback

# 10. Device / Hardware Context
Scanner type: Hardware/camera
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes on invalid scans

# 11. Navigation Rules
Entry point: Queue or transfer alert
Exit path: MOB-003
Back behavior: Prompt on unsaved movement
Deep links (if any): Bin detail deep link

# 12. Edge Cases
- Multiple SKUs in source bin
- Destination capacity changes mid-task
- Interrupted move (partial physically moved)

# 13. Notes for Designer (Optional but powerful)
- Keep workflow linear and explicit
- Avoid hidden required fields
