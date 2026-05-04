# 1. Screen Overview
Screen ID: MOB-015
Name: Inter-Warehouse Transfer Receive
Primary Persona: Floor Operator

Goal of Screen (1 line): Receive inbound transfer and reconcile in-transit vs received stock.

What should the user accomplish here?
- Confirm received quantities and capture discrepancies immediately.

# 2. Primary Action (Critical)
Main CTA: Confirm Transfer Receipt
Success condition: Receipt posted with variances/discrepancies logged.
What happens after success:
- Transfer closes or remains partial with open discrepancy case.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Transfer manifest, in-transit qty vs received qty, Confirm CTA
🟡 Secondary (visible but less prominent)
- Damage/missing toggles, discrepancy summary
⚪ Tertiary (hidden / expandable)
- Transit notes, source dispatch metadata

# 4. Layout Structure (Wireframe in words)
Header: Transfer ID and destination warehouse
Body: Manifest line list with receive inputs
Footer / Sticky CTA: Confirm Receipt
Floating elements: Create discrepancy case button

# 5. Interaction Model
Tap actions: Enter received qty, mark damaged/missing, confirm
Swipe actions: Open quick discrepancy form
Scan behavior: Manifest scan then line-level SKU scans
Auto-navigation rules: Auto-suggest discrepancy when mismatch detected

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Manifest skeleton |
| Empty | No transfer awaiting receipt |
| Error | Blocking mismatch validation when required fields missing |
| Success | Receipt confirmation with case ID if needed |

# 7. Error Handling (Important for ops apps)
Error type: Quantity mismatch without reason
User feedback: Red inline requirement
Recovery action: Add discrepancy reason and retry

Error type: Unknown manifest scan
User feedback: Red toast + beep
Recovery action: Rescan or manual search

# 8. Visual Priority & Cues
- Red: discrepancy blocking conditions
- Yellow: partial receipt warning
- Green: receipt completed
- Blue: actionable line controls
- Badge usage: Damaged, missing, partial
- Icon expectations: receipt, warning, case ID

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 3
Offline support: Yes (queued receive)
Latency tolerance: < 350ms scan response

# 10. Device / Hardware Context
Scanner type: Hardware/camera
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes on invalid scans

# 11. Navigation Rules
Entry point: Transfer receive task
Exit path: MOB-003 or discrepancy flow
Back behavior: Confirm before leaving unsaved receipt lines
Deep links (if any): Discrepancy case deep link

# 12. Edge Cases
- Partial receipt across multiple docks
- Damaged quantity exceeds received quantity entry
- Duplicate manifest receipt attempt

# 13. Notes for Designer (Optional but powerful)
- Keep mismatch handling immediate and simple
- Do not hide discrepancy creation path
