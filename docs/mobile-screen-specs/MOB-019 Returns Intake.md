# 1. Screen Overview
Screen ID: MOB-019
Name: Returns Intake
Primary Persona: Floor Operator

Goal of Screen (1 line): Register and receive returned items into designated returns area.

What should the user accomplish here?
- Intake returns accurately with correct category and traceability.

# 2. Primary Action (Critical)
Main CTA: Confirm Return Intake
Success condition: Return reference and item details validated and posted.
What happens after success:
- Item moves to return inspection queue (MOB-020 or web QC queue).

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Return reference, category, item scan, Confirm CTA
🟡 Secondary (visible but less prominent)
- Customer/order details, claimed reason
⚪ Tertiary (hidden / expandable)
- Original shipment metadata, support notes

# 4. Layout Structure (Wireframe in words)
Header: Return batch context
Body: Scan and category selection form
Footer / Sticky CTA: Confirm Return Intake
Floating elements: Manual lookup shortcut

# 5. Interaction Model
Tap actions: Select category, enter notes, confirm
Swipe actions: Remove incorrect scanned item
Scan behavior: Scan SRN/order and item serial/SKU
Auto-navigation rules: On success, open next return or inspection prompt

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Intake form skeleton |
| Empty | No pending return references |
| Error | Invalid return reference message |
| Success | Intake receipt confirmation |

# 7. Error Handling (Important for ops apps)
Error type: Missing serial for serialized SKU
User feedback: Red required-field error
Recovery action: Rescan or manual serial entry

Error type: Return category-policy mismatch
User feedback: Yellow warning banner
Recovery action: Choose valid category or escalate

# 8. Visual Priority & Cues
- Red: intake validation blocks
- Yellow: category or warranty warning
- Green: return received
- Blue: next actions
- Badge usage: Warranty, DOA, commercial
- Icon expectations: return arrow, customer, serial

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 3
Offline support: Yes
Latency tolerance: < 350ms scan lookup

# 10. Device / Hardware Context
Scanner type: Hardware/camera
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes on scan failure

# 11. Navigation Rules
Entry point: Task queue or returns alert
Exit path: MOB-020 or next intake item
Back behavior: Warn on unsaved intake form
Deep links (if any): SRN deep link

# 12. Edge Cases
- Return without prior order linkage
- Duplicate intake attempt
- Partial item kit return

# 13. Notes for Designer (Optional but powerful)
- Keep category selection clear and fast
- Minimize manual typing
