# 1. Screen Overview
Screen ID: MOB-014
Name: Inter-Warehouse Transfer Pick
Primary Persona: Floor Operator

Goal of Screen (1 line): Pick transfer order lines and stage for dispatch to destination warehouse.

What should the user accomplish here?
- Complete source-warehouse picking for transfer with dispatch readiness.

# 2. Primary Action (Critical)
Main CTA: Confirm Transfer Pick and Stage
Success condition: Transfer lines picked and staged quantities recorded.
What happens after success:
- Transfer status moves to ready-for-dispatch.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Transfer order ID, required qty, staged qty, Confirm CTA
🟡 Secondary (visible but less prominent)
- Destination warehouse, dispatch lane, partial dispatch rules
⚪ Tertiary (hidden / expandable)
- Transfer notes, priority rationale

# 4. Layout Structure (Wireframe in words)
Header: Transfer header with source/destination
Body: Pick line execution list with stage confirmation
Footer / Sticky CTA: Confirm Pick and Stage
Floating elements: Partial dispatch toggle

# 5. Interaction Model
Tap actions: Open line, confirm qty, mark partial, finalize stage
Swipe actions: Skip line with reason
Scan behavior: Bin and SKU scan per line; stage location scan
Auto-navigation rules: Auto-next line on success

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Transfer line skeleton |
| Empty | No open lines remaining |
| Error | Scan/qty mismatch inline error |
| Success | Staged status and progress update |

# 7. Error Handling (Important for ops apps)
Error type: Short source stock
User feedback: Yellow shortage warning
Recovery action: Mark partial and notify supervisor

Error type: Invalid stage lane
User feedback: Red banner + beep
Recovery action: Scan assigned lane

# 8. Visual Priority & Cues
- Red: invalid staging
- Yellow: partial dispatch warning
- Green: line staged
- Blue: line actions
- Badge usage: Partial, urgent transfer
- Icon expectations: warehouse-to-warehouse arrow

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 3 per line
Offline support: Yes
Latency tolerance: < 300ms feedback

# 10. Device / Hardware Context
Scanner type: Hardware preferred
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes on mismatch

# 11. Navigation Rules
Entry point: Transfer task queue
Exit path: MOB-012 or MOB-003
Back behavior: Warn on incomplete staging
Deep links (if any): Transfer order deep link

# 12. Edge Cases
- Destination changed after picking started
- Split staging across multiple lanes
- Transfer cancelled mid-pick

# 13. Notes for Designer (Optional but powerful)
- Show destination context prominently
- Make partial handling explicit and safe
