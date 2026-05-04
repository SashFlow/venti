# 1. Screen Overview
Screen ID: MOB-010
Name: Short Pick Exception
Primary Persona: Floor Operator

Goal of Screen (1 line): Capture short-pick reason and resolve with alternate source or escalation.

What should the user accomplish here?
- Close short-pick quickly while preserving service impact visibility.

# 2. Primary Action (Critical)
Main CTA: Submit Short Pick Resolution
Success condition: Reason logged and next action chosen.
What happens after success:
- Continue picking with alternate bin or create supervisor exception case.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Required vs picked vs short qty, reason selector, Submit CTA
🟡 Secondary (visible but less prominent)
- Alternate bin suggestions, order impact
⚪ Tertiary (hidden / expandable)
- Past shortages, suggested corrective actions

# 4. Layout Structure (Wireframe in words)
Header: Pick line context + SLA risk
Body: Short reason form + alternate options
Footer / Sticky CTA: Submit Resolution
Floating elements: Escalate button

# 5. Interaction Model
Tap actions: Select reason, choose alternate, escalate, submit
Swipe actions: Dismiss suggestion cards
Scan behavior: Optional scan alternate bin to continue pick
Auto-navigation rules: If alternate selected, return to MOB-009

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Skeleton on impact panel |
| Empty | No alternate bins available message |
| Error | Validation error for missing reason |
| Success | Resolution saved + route forward |

# 7. Error Handling (Important for ops apps)
Error type: Missing reason code
User feedback: Inline red field state
Recovery action: Select reason and retry

Error type: Alternate bin no longer available
User feedback: Yellow warning toast
Recovery action: Refresh alternates or escalate

# 8. Visual Priority & Cues
- Red: major order impact/SLA breach
- Yellow: warning and degraded service
- Green: exception resolved
- Blue: actionable alternate choices
- Badge usage: High impact, escalated
- Icon expectations: warning triangle, route alternate

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2
Offline support: Yes (exception queue)
Latency tolerance: < 400ms for alternate fetch

# 10. Device / Hardware Context
Scanner type: Optional for alternate confirmation
Gloves usage: Yes
Sound feedback: Yes for escalation acknowledgment
Vibration: Yes on critical risk

# 11. Navigation Rules
Entry point: MOB-009 short-pick branch
Exit path: MOB-009 or MOB-023
Back behavior: Confirm before discarding exception details
Deep links (if any): Supervisor alert deep link

# 12. Edge Cases
- Multiple alternates with similar distances
- Customer priority order among impacted lines
- Repeated short pick on same SKU same shift

# 13. Notes for Designer (Optional but powerful)
- Keep resolution choices obvious and fast
- Expose impact without overwhelming operator
