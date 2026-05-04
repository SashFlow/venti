# 1. Screen Overview
Screen ID: MOB-023
Name: Exception Inbox
Primary Persona: Floor Operator, Supervisor

Goal of Screen (1 line): Centralize exception cases for claim, diagnosis, and resolution/escalation.

What should the user accomplish here?
- Resolve exceptions within SLA using structured actions.

# 2. Primary Action (Critical)
Main CTA: Resolve Exception
Success condition: Resolution action and root cause saved.
What happens after success:
- Exception status changes to resolved or escalated.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Exception code, impacted document, SLA timer, Resolve CTA
🟡 Secondary (visible but less prominent)
- Current owner, severity, suggested playbook
⚪ Tertiary (hidden / expandable)
- Full timeline, attachments, policy references

# 4. Layout Structure (Wireframe in words)
Header: Severity filters and SLA summary
Body: Exception list + detail drawer
Footer / Sticky CTA: Resolve or Escalate
Floating elements: Claim exception FAB

# 5. Interaction Model
Tap actions: Claim, add root cause, resolve, escalate
Swipe actions: Quick claim/unclaim
Scan behavior: Scan document ID to open linked exception
Auto-navigation rules: Resolved case collapses and next case surfaces

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | List + detail skeleton |
| Empty | No open exceptions |
| Error | Case load failure with retry |
| Success | Status chip changes and timestamp update |

# 7. Error Handling (Important for ops apps)
Error type: Missing root cause on resolve
User feedback: Inline mandatory field error
Recovery action: Select root cause and retry

Error type: Escalation target unavailable
User feedback: Yellow warning
Recovery action: Route to fallback supervisor queue

# 8. Visual Priority & Cues
- Red: critical and breached exceptions
- Yellow: pending warning
- Green: resolved
- Blue: actionable resolution controls
- Badge usage: Claimed, escalated, recurring
- Icon expectations: alert, assignee, escalation

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2 to 3
Offline support: Partial (queued comments/resolution)
Latency tolerance: < 350ms detail open

# 10. Device / Hardware Context
Scanner type: Optional for document jump
Gloves usage: Yes
Sound feedback: Optional
Vibration: Yes for critical SLA breaches

# 11. Navigation Rules
Entry point: MOB-022 or task queue
Exit path: Linked operational task or queue
Back behavior: Preserve current filter and case selection
Deep links (if any): Exception case deep link

# 12. Edge Cases
- One exception linked to multiple documents
- Reopened exception after resolution
- Concurrent edits by two users

# 13. Notes for Designer (Optional but powerful)
- Keep root-cause and resolution path fast
- SLA timer should remain visible during detail view
