# 1. Screen Overview
Screen ID: MOB-021
Name: Technician Stock Consume
Primary Persona: Service Technician

Goal of Screen (1 line): Consume service part inventory against service tickets and trigger replenishment when needed.

What should the user accomplish here?
- Record part consumption accurately with minimal interruption to service work.

# 2. Primary Action (Critical)
Main CTA: Confirm Consumption
Success condition: Part, ticket, and quantity validated and posted.
What happens after success:
- Stock updated; low-level replenishment suggestion generated if needed.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Part ID, service ticket, consumed qty, Confirm CTA
🟡 Secondary (visible but less prominent)
- Current on-hand, min/max levels, compatibility warnings
⚪ Tertiary (hidden / expandable)
- Prior usage history, notes

# 4. Layout Structure (Wireframe in words)
Header: Technician identity and job context
Body: Scan form + stock level panel
Footer / Sticky CTA: Confirm Consumption
Floating elements: Replenishment request quick action

# 5. Interaction Model
Tap actions: Enter qty, confirm, trigger replenishment
Swipe actions: Remove scanned part line
Scan behavior: Scan part and service ticket barcode
Auto-navigation rules: Auto-suggest replenishment on threshold breach

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Form and stock panel skeleton |
| Empty | No assigned service tickets |
| Error | Incompatible part or invalid ticket errors |
| Success | Confirmation toast + stock level update |

# 7. Error Handling (Important for ops apps)
Error type: Part-ticket incompatibility
User feedback: Red blocking banner
Recovery action: Choose compatible part

Error type: Quantity exceeds available
User feedback: Inline qty error
Recovery action: Adjust qty or request transfer

# 8. Visual Priority & Cues
- Red: incompatible or invalid usage
- Yellow: low stock warning
- Green: consumption recorded
- Blue: replenishment action
- Badge usage: Below min, critical part
- Icon expectations: wrench, part, alert

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 3
Offline support: Yes
Latency tolerance: < 300ms scan and validation response

# 10. Device / Hardware Context
Scanner type: Camera/hardware
Gloves usage: Yes
Sound feedback: Optional
Vibration: Yes on validation failure

# 11. Navigation Rules
Entry point: Task queue or job detail
Exit path: MOB-003 or next ticket
Back behavior: Warn before exiting unsaved form
Deep links (if any): Service ticket deep link

# 12. Edge Cases
- Ticket closed while consumption in progress
- Part superseded by substitute SKU
- Replenishment destination not configured

# 13. Notes for Designer (Optional but powerful)
- Keep ticket + part context always visible
- Make low-stock warning actionable immediately
