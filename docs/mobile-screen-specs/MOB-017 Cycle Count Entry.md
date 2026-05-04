# 1. Screen Overview
Screen ID: MOB-017
Name: Cycle Count Entry
Primary Persona: Floor Operator, Inventory Counter

Goal of Screen (1 line): Capture accurate counted quantity per bin/SKU with optional anomaly evidence.

What should the user accomplish here?
- Submit trustworthy count values quickly with clear variance indicators.

# 2. Primary Action (Critical)
Main CTA: Save Count
Success condition: Count value and required fields validated and posted.
What happens after success:
- Next bin/SKU entry opens automatically.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Bin ID, SKU, count input, Save CTA
🟡 Secondary (visible but less prominent)
- Book qty (policy dependent), variance indicator, last count time
⚪ Tertiary (hidden / expandable)
- Notes/photos, prior adjustments

# 4. Layout Structure (Wireframe in words)
Header: Route progress and bin context
Body: Scan/entry form + variance panel
Footer / Sticky CTA: Save Count
Floating elements: Add note/photo shortcut

# 5. Interaction Model
Tap actions: Enter count, add note, save
Swipe actions: Next/previous line
Scan behavior: Scan bin and SKU to bind entry
Auto-navigation rules: Save count -> auto-next open line

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Entry form skeleton |
| Empty | Bin has no expected SKU message |
| Error | Inline invalid quantity and scan mismatch errors |
| Success | Green save feedback with progress update |

# 7. Error Handling (Important for ops apps)
Error type: Invalid negative quantity
User feedback: Inline field error
Recovery action: Correct quantity and resubmit

Error type: Bin/SKU mismatch
User feedback: Red banner + beep
Recovery action: Rescan correct labels

# 8. Visual Priority & Cues
- Red: critical variance or mismatch
- Yellow: moderate variance warning
- Green: saved entry
- Blue: active inputs
- Badge usage: Recount needed, high value SKU
- Icon expectations: count, variance, camera

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2 per item
Offline support: Yes
Latency tolerance: < 300ms post-save feedback

# 10. Device / Hardware Context
Scanner type: Hardware/camera
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes on scan mismatch

# 11. Navigation Rules
Entry point: MOB-016
Exit path: MOB-018 for high variance or next line
Back behavior: Confirm before losing unsaved count
Deep links (if any): Bin deep link from alert

# 12. Edge Cases
- Mixed SKU bin not pre-modeled
- Count interrupted by urgent task
- Manual entry required due to label damage

# 13. Notes for Designer (Optional but powerful)
- Count input must be extremely legible
- Keep variance signals immediate but not noisy
