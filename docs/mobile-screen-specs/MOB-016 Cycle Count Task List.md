# 1. Screen Overview
Screen ID: MOB-016
Name: Cycle Count Task List
Primary Persona: Floor Operator, Inventory Counter

Goal of Screen (1 line): Present assigned count routes and start counting with minimal delay.

What should the user accomplish here?
- Begin the right count route and understand priority/recount requirements.

# 2. Primary Action (Critical)
Main CTA: Start Count Route
Success condition: Route claimed and first bin counting screen opened.
What happens after success:
- Navigate to MOB-017.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Count class, route ID, pending bins, Start CTA
🟡 Secondary (visible but less prominent)
- Freeze status, recount badges, due time
⚪ Tertiary (hidden / expandable)
- Historical accuracy for route zones

# 4. Layout Structure (Wireframe in words)
Header: Count plan context (ABC/random/zone)
Body: Route cards and bin sequence preview
Footer / Sticky CTA: Start Count Route
Floating elements: Frozen-bin-only toggle

# 5. Interaction Model
Tap actions: Select route, start, skip with reason
Swipe actions: Quick skip bin
Scan behavior: Optional route label scan
Auto-navigation rules: Start opens first assigned bin in MOB-017

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Route skeleton cards |
| Empty | No count assignments |
| Error | Failed assignment sync banner |
| Success | Route active indicator |

# 7. Error Handling (Important for ops apps)
Error type: Route already claimed
User feedback: Yellow lock toast
Recovery action: Refresh and pick new route

Error type: Frozen bin inaccessible
User feedback: Warning modal
Recovery action: Skip with reason and notify supervisor

# 8. Visual Priority & Cues
- Red: overdue count route
- Yellow: recount required
- Green: completed route
- Blue: selectable route
- Badge usage: Frozen, recount, priority
- Icon expectations: clipboard, bin route, timer

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2
Offline support: Yes (cached assignments)
Latency tolerance: < 300ms route open

# 10. Device / Hardware Context
Scanner type: Optional for route/bin quick open
Gloves usage: Yes
Sound feedback: Optional
Vibration: Yes on critical warnings

# 11. Navigation Rules
Entry point: MOB-003 or scheduled alert
Exit path: MOB-017
Back behavior: Preserve selected filters
Deep links (if any): Recount alert deep link

# 12. Edge Cases
- Count route reassigned mid-shift
- Bin under active movement task
- Duplicate recount requests

# 13. Notes for Designer (Optional but powerful)
- Keep route priority and due status obvious
- Reduce taps to start counting
