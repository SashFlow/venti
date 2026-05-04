# 1. Screen Overview
Screen ID: MOB-011
Name: Pack Handoff Confirmation
Primary Persona: Floor Operator

Goal of Screen (1 line): Confirm picked items are handed off correctly to packing with traceable tote/carton linkage.

What should the user accomplish here?
- Complete a reliable pick-to-pack transition without item loss.

# 2. Primary Action (Critical)
Main CTA: Confirm Handoff
Success condition: Tote/carton scan validated and handoff posted.
What happens after success:
- Task marked complete and next operational task suggested.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Tote/carton ID, order references, Confirm CTA
🟡 Secondary (visible but less prominent)
- Weight, carton recommendation, cutoff time
⚪ Tertiary (hidden / expandable)
- Packaging notes, special handling metadata

# 4. Layout Structure (Wireframe in words)
Header: Current wave/order context
Body: Handoff checklist + scan block
Footer / Sticky CTA: Confirm Handoff
Floating elements: Print pack label shortcut

# 5. Interaction Model
Tap actions: Confirm items, request label print, flag issue
Swipe actions: Mark item as questionable
Scan behavior: Scan tote/carton and optional order verification
Auto-navigation rules: On success, return to queue

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Checklist skeleton |
| Empty | No handoff tasks pending |
| Error | Mismatch banner with highlighted discrepancy |
| Success | Green confirmation + completion stamp |

# 7. Error Handling (Important for ops apps)
Error type: Tote mismatch
User feedback: Red banner + beep
Recovery action: Rescan or manual verification

Error type: Label printer unavailable
User feedback: Yellow warning toast
Recovery action: Queue print job or use alternate printer

# 8. Visual Priority & Cues
- Red: handoff mismatch
- Yellow: packaging warnings
- Green: confirmed handoff
- Blue: next actions
- Badge usage: Fragile, urgent cutoff
- Icon expectations: box, label, handoff arrow

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2
Offline support: Yes (queued handoff)
Latency tolerance: < 300ms scan acknowledgment

# 10. Device / Hardware Context
Scanner type: Hardware/camera
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes on mismatch

# 11. Navigation Rules
Entry point: MOB-009 completion or task queue
Exit path: MOB-003
Back behavior: Confirm before exit if unsaved
Deep links (if any): Handoff alert link

# 12. Edge Cases
- Mixed orders in one tote
- Partial handoff due to packaging damage
- Duplicate tote scan

# 13. Notes for Designer (Optional but powerful)
- Keep handoff confirmation instant and explicit
- Prioritize mismatch visibility
