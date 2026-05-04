# 1. Screen Overview
Screen ID: MOB-005
Name: Inbound Scan and Validate
Primary Persona: Floor Operator

Goal of Screen (1 line): Validate inbound lines by scan and quantity entry with immediate policy checks.

What should the user accomplish here?
- Capture accurate receipt data including serial/lot/expiry and discrepancies.

# 2. Primary Action (Critical)
Main CTA: Save Line and Continue
Success condition: Scanned line passes validation and is posted.
What happens after success:
- Next pending line auto-loads or prompts QC routing.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Current SKU, expected qty, received qty input, validation status, Save CTA
🟡 Secondary (visible but less prominent)
- SKU attributes, expiry/manufacture date, damage toggle
⚪ Tertiary (hidden / expandable)
- Historical receipts, supplier compliance notes

# 4. Layout Structure (Wireframe in words)
Header: GRN reference + line progress
Body: Scan area + line detail form
Footer / Sticky CTA: Save Line and Continue
Floating elements: Scanner trigger, manual entry fallback

# 5. Interaction Model
Tap actions: Enter qty, mark damage, save
Swipe actions: Move between lines
Scan behavior: Scan shipment then SKU then serial/lot; auto-fill fields
Auto-navigation rules: Successful save auto-advances to next line

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Form skeleton and disabled CTA |
| Empty | No pending lines message + finish session CTA |
| Error | Inline field errors + red banner |
| Success | Green confirmation with auto-advance |

# 7. Error Handling (Important for ops apps)
Error type: Duplicate serial
User feedback: Red inline error + beep
Recovery action: Rescan or override with reason if policy allows

Error type: Over-receipt beyond tolerance
User feedback: Blocking modal with variance details
Recovery action: Request supervisor approval or adjust quantity

# 8. Visual Priority & Cues
- Red: hard validation failures
- Yellow: warning/soft rule breach
- Green: line validated and saved
- Blue: active input and scan prompts
- Badge usage: QC candidate, damaged units
- Icon expectations: barcode, warning, check

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 3 per line
Offline support: Yes (queue writes)
Latency tolerance: < 300ms scan feedback

# 10. Device / Hardware Context
Scanner type: Hardware preferred, camera fallback
Gloves usage: Yes
Sound feedback: Yes (distinct success/fail tones)
Vibration: Yes on errors

# 11. Navigation Rules
Entry point: MOB-004
Exit path: MOB-006 or back to MOB-004 on completion
Back behavior: Confirmation before leaving unsaved changes
Deep links (if any): Direct line deep link from exception alerts

# 12. Edge Cases
- Unknown barcode
- Partial carton damage with mixed disposition
- Interrupted scan due to connection loss

# 13. Notes for Designer (Optional but powerful)
- Scanner-first UX
- Keep quantity input highly legible
- Make errors impossible to miss
