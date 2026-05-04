# 1. Screen Overview
Screen ID: MOB-018
Name: Recount and Variance Note
Primary Persona: Floor Operator, Supervisor

Goal of Screen (1 line): Recount discrepant inventory and capture reason for variance approval flow.

What should the user accomplish here?
- Resolve or formalize variance with complete evidence.

# 2. Primary Action (Critical)
Main CTA: Submit Recount
Success condition: Recount value and reason are recorded.
What happens after success:
- Variance case routed for supervisor approval if threshold exceeded.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- First count vs recount, variance amount/value, Submit CTA
🟡 Secondary (visible but less prominent)
- Threshold guidance, reason selector
⚪ Tertiary (hidden / expandable)
- Photo evidence, historical variance trend

# 4. Layout Structure (Wireframe in words)
Header: Variance case summary
Body: Recount input + reason/evidence panel
Footer / Sticky CTA: Submit Recount
Floating elements: Supervisor review request

# 5. Interaction Model
Tap actions: Enter recount, pick reason, attach photo, submit
Swipe actions: Switch among discrepant lines
Scan behavior: Optional rescan bin/SKU for reconfirmation
Auto-navigation rules: Auto-route to approval queue when required

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Case skeleton |
| Empty | No pending variances |
| Error | Missing reason/evidence inline errors |
| Success | Submission toast + status badge change |

# 7. Error Handling (Important for ops apps)
Error type: Recount unchanged but high variance value
User feedback: Yellow warning
Recovery action: Require supervisor note

Error type: Threshold breach without escalation
User feedback: Red blocking message
Recovery action: Trigger escalation before submit

# 8. Visual Priority & Cues
- Red: threshold breach requiring approval
- Yellow: notable variance warning
- Green: recount submitted
- Blue: evidence and action controls
- Badge usage: Needs approval, under review
- Icon expectations: warning, recount, approval

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 3
Offline support: Partial (queue with approval hold)
Latency tolerance: < 400ms submit response

# 10. Device / Hardware Context
Scanner type: Optional for reconfirm
Gloves usage: Yes
Sound feedback: Optional
Vibration: Yes for blocking errors

# 11. Navigation Rules
Entry point: MOB-017 variance path
Exit path: MOB-016 or MOB-003
Back behavior: Prompt before discarding notes
Deep links (if any): Approval case deep link

# 12. Edge Cases
- Multiple recount attempts
- Supervisor unavailable in shift
- Evidence attachment fails offline

# 13. Notes for Designer (Optional but powerful)
- Keep reason capture streamlined
- Show financial impact only when needed
