# 1. Screen Overview
Screen ID: MOB-006
Name: QC Routing Decision Prompt
Primary Persona: Floor Operator

Goal of Screen (1 line): Decide whether received stock goes to QC hold or bypasses QC under policy.

What should the user accomplish here?
- Route inbound stock correctly with minimal delay and full policy compliance.

# 2. Primary Action (Critical)
Main CTA: Confirm QC Route
Success condition: Route selected and recorded with required reason/approval.
What happens after success:
- Task proceeds to QC queue or putaway flow.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Rule outcome, QC required status, Confirm CTA
🟡 Secondary (visible but less prominent)
- Sample quantity, inspection type, override eligibility
⚪ Tertiary (hidden / expandable)
- Policy text, historical pass rates

# 4. Layout Structure (Wireframe in words)
Header: GRN and SKU context
Body: Decision cards (Send to QC / Bypass with reason)
Footer / Sticky CTA: Confirm QC Route
Floating elements: Policy info drawer

# 5. Interaction Model
Tap actions: Select route, enter override reason, confirm
Swipe actions: None
Scan behavior: Optional scan revalidation before bypass
Auto-navigation rules: QC route opens QC task path; bypass goes putaway

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Decision cards disabled |
| Empty | No QC rule configured notice |
| Error | Blocking policy error modal |
| Success | Route confirmation toast + next step |

# 7. Error Handling (Important for ops apps)
Error type: Bypass not permitted
User feedback: Red blocking banner
Recovery action: Force QC route

Error type: Missing override reason
User feedback: Inline required-field message
Recovery action: Enter reason and retry

# 8. Visual Priority & Cues
- Red: mandatory QC lock
- Yellow: conditional route warning
- Green: route accepted
- Blue: selectable decision option
- Badge usage: Mandatory/Optional QC
- Icon expectations: shield, checklist, warning

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2
Offline support: Partial (decision queued with restrictions)
Latency tolerance: < 300ms decision feedback

# 10. Device / Hardware Context
Scanner type: Optional
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes on blocked bypass

# 11. Navigation Rules
Entry point: MOB-005
Exit path: MOB-007 or QC workflow
Back behavior: Return to previous line context
Deep links (if any): Policy deep link

# 12. Edge Cases
- Rule changed mid-session
- Required sample quantity exceeds received qty
- Supervisor override needed but unavailable

# 13. Notes for Designer (Optional but powerful)
- Make policy outcome unambiguous
- Keep override path explicit and auditable
