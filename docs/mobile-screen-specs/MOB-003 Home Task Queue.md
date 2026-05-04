# 1. Screen Overview
Screen ID: MOB-003
Name: Home Task Queue
Primary Persona: Floor Operator, Service Technician

Goal of Screen (1 line): Surface the next best task and allow fast claim/start/resume.

What should the user accomplish here?
- Start work with minimal decision friction while preserving SLA priorities.

# 2. Primary Action (Critical)
Main CTA: Start Next Recommended Task
Success condition: Task claimed and task detail opened.
What happens after success:
- Navigate to the corresponding execution screen.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Task card: task type, priority, SLA timer, start CTA
🟡 Secondary (visible but less prominent)
- Source/destination, quantity progress, owner
⚪ Tertiary (hidden / expandable)
- Task history, previous assignees, metadata

# 4. Layout Structure (Wireframe in words)
Header: User, shift status, active alerts count
Body: Scrollable prioritized task list with filter chips
Footer / Sticky CTA: Start next task
Floating elements: Scanner shortcut and exception badge

# 5. Interaction Model
Tap actions: Filter, claim/unclaim, start, pause/resume
Swipe actions: Swipe card to quick-claim or quick-pause
Scan behavior: Scan task ID to jump to task
Auto-navigation rules: Opening task auto-routes by type

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Task card skeleton list |
| Empty | No tasks message + refresh CTA |
| Error | Retry banner + cached tasks fallback |
| Success | Card collapse + navigation to next screen |

# 7. Error Handling (Important for ops apps)
Error type: Stale task claim
User feedback: Yellow toast + card refresh
Recovery action: Offer next best task

Error type: Permission mismatch
User feedback: Red inline lock note
Recovery action: Reassign request flow

# 8. Visual Priority & Cues
- Red: SLA breach/critical task
- Yellow: warning/near breach
- Green: completed task
- Blue: actionable task and filters
- Badge usage: Priority and exception badges
- Icon expectations: task type icons

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2
Offline support: Yes (cached queue)
Latency tolerance: < 300ms list interaction feedback

# 10. Device / Hardware Context
Scanner type: Hardware/camera for task jump
Gloves usage: Yes
Sound feedback: Optional task start tone
Vibration: Yes for critical alerts

# 11. Navigation Rules
Entry point: MOB-002 or return from task
Exit path: Task-specific screen
Back behavior: From task screen returns to filtered queue state
Deep links (if any): Alert deep link to task ID

# 12. Edge Cases
- No task assigned for role
- Claimed task times out
- High-priority interrupt arrives mid-task

# 13. Notes for Designer (Optional but powerful)
- Scanner-first UX
- Keep card density high but readable
- Strong visual SLA urgency cues
