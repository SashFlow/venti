# 1. Screen Overview
Screen ID: MOB-008
Name: Pick Task List
Primary Persona: Floor Operator

Goal of Screen (1 line): Present assigned wave picks in efficient execution order.

What should the user accomplish here?
- Start and complete pick runs with optimal route and SLA compliance.

# 2. Primary Action (Critical)
Main CTA: Start Wave Pick
Success condition: Wave activated and first pick line opened.
What happens after success:
- Navigate to MOB-009 for pick execution.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Wave ID, cutoff, pending lines, Start CTA
🟡 Secondary (visible but less prominent)
- Route estimate, batch grouping, reassignment option
⚪ Tertiary (hidden / expandable)
- Order-level details, picker performance history

# 4. Layout Structure (Wireframe in words)
Header: Wave selector and cutoff risk
Body: Pick list cards grouped by route
Footer / Sticky CTA: Start Wave Pick
Floating elements: Re-sequence toggle

# 5. Interaction Model
Tap actions: Select wave, start, request reassignment
Swipe actions: Quick-prioritize a line
Scan behavior: Optional scan wave label to open
Auto-navigation rules: Auto-open next line after each completion

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Wave list skeleton |
| Empty | No assigned waves + refresh CTA |
| Error | Retry and fallback cached route |
| Success | Active wave badge + transition |

# 7. Error Handling (Important for ops apps)
Error type: Wave locked by supervisor
User feedback: Yellow lock toast
Recovery action: Request unlock

Error type: Route computation failed
User feedback: Warning banner
Recovery action: Use default sequencing

# 8. Visual Priority & Cues
- Red: cutoff at risk
- Yellow: route inefficiency warning
- Green: wave complete
- Blue: active selection/start
- Badge usage: Urgent, multi-order, reassigned
- Icon expectations: route, timer, wave

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2
Offline support: Partial (active wave cache)
Latency tolerance: < 400ms for route resorting

# 10. Device / Hardware Context
Scanner type: Optional wave label scan
Gloves usage: Yes
Sound feedback: Optional start cue
Vibration: Yes for urgent interrupts

# 11. Navigation Rules
Entry point: MOB-003
Exit path: MOB-009
Back behavior: Preserve filters and selected wave
Deep links (if any): Alert deep link to wave

# 12. Edge Cases
- Same user assigned overlapping waves
- Wave paused by supervisor during execution
- Cutoff changed after wave creation

# 13. Notes for Designer (Optional but powerful)
- Route clarity is more important than visual density
- Keep SLA countdown always visible
