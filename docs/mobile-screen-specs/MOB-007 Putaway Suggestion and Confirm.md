# 1. Screen Overview
Screen ID: MOB-007
Name: Putaway Suggestion and Confirm
Primary Persona: Floor Operator

Goal of Screen (1 line): Confirm best-fit destination bin and complete putaway by scan.

What should the user accomplish here?
- Place stock into valid location with fast movement and zero placement errors.

# 2. Primary Action (Critical)
Main CTA: Confirm Putaway
Success condition: Destination bin scan matches valid recommendation.
What happens after success:
- Movement posted and next putaway task opens.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Suggested bin, quantity, Confirm CTA
🟡 Secondary (visible but less prominent)
- Distance, occupancy, capacity checks
⚪ Tertiary (hidden / expandable)
- Alternate bins, rule explanation, travel map

# 4. Layout Structure (Wireframe in words)
Header: Task and SKU summary
Body: Suggested bin card + scan confirmation area
Footer / Sticky CTA: Confirm Putaway
Floating elements: Alternate bin picker

# 5. Interaction Model
Tap actions: Accept suggestion, request alternate, confirm
Swipe actions: Cycle between suggestions
Scan behavior: Scan destination bin to validate
Auto-navigation rules: Auto-advance to next line/task after success

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Suggestion skeleton cards |
| Empty | No valid bin found + escalate CTA |
| Error | Wrong-zone/blocked-bin inline error |
| Success | Green check with updated occupancy |

# 7. Error Handling (Important for ops apps)
Error type: Bin full
User feedback: Red capacity warning
Recovery action: Offer nearest alternate bins

Error type: Wrong-zone scan
User feedback: Red banner + beep
Recovery action: Rescan recommended bin or request override

# 8. Visual Priority & Cues
- Red: invalid bin or restriction violation
- Yellow: near-capacity warnings
- Green: successful putaway
- Blue: recommendation and action links
- Badge usage: Best fit, alternate, restricted
- Icon expectations: map pin, capacity, route

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2
Offline support: Yes (queued confirmation with local validation)
Latency tolerance: < 300ms scan validation

# 10. Device / Hardware Context
Scanner type: Hardware preferred
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes on invalid scan

# 11. Navigation Rules
Entry point: MOB-006 or inbound flow
Exit path: Next putaway task or MOB-003
Back behavior: Prompt before leaving unfinished task
Deep links (if any): Location detail deep link

# 12. Edge Cases
- Suggested bin becomes unavailable mid-task
- Mixed UOM causing capacity mismatch
- Multiple operators targeting same bin

# 13. Notes for Designer (Optional but powerful)
- Emphasize scan target and success cue
- Minimize cognitive load on location choice
