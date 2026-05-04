# 1. Screen Overview
Screen ID: MOB-012
Name: Dispatch Scan Confirmation
Primary Persona: Floor Operator

Goal of Screen (1 line): Confirm shipments loaded to the correct vehicle in the correct sequence.

What should the user accomplish here?
- Finalize dispatch loading with zero misloads.

# 2. Primary Action (Critical)
Main CTA: Confirm Loaded to Vehicle
Success condition: Shipment scans reconcile with planned load list.
What happens after success:
- Dispatch milestone updates and shipment status advances.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Vehicle, shipment count progress, Confirm CTA
🟡 Secondary (visible but less prominent)
- Driver name, route code, departure time
⚪ Tertiary (hidden / expandable)
- Dispatch notes, carrier contact info

# 4. Layout Structure (Wireframe in words)
Header: Dispatch lane and vehicle details
Body: Scan list and loaded vs planned panel
Footer / Sticky CTA: Confirm Loaded
Floating elements: Sequence reorder prompt

# 5. Interaction Model
Tap actions: Assign sequence, confirm load, add note
Swipe actions: Remove mis-scanned item
Scan behavior: Sequential shipment label scan with dedupe guard
Auto-navigation rules: Auto-close when planned list complete

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Vehicle manifest skeleton |
| Empty | No planned dispatches for lane |
| Error | Invalid shipment scan alert |
| Success | Completion stamp + route summary |

# 7. Error Handling (Important for ops apps)
Error type: Shipment not in manifest
User feedback: Red banner + beep
Recovery action: Recheck vehicle assignment or escalate

Error type: Duplicate scan
User feedback: Yellow toast
Recovery action: Ignore duplicate and continue

# 8. Visual Priority & Cues
- Red: misload risk
- Yellow: duplicate/out-of-sequence warning
- Green: loaded and confirmed
- Blue: actionable sequence controls
- Badge usage: urgent dispatch, delayed
- Icon expectations: truck, route, barcode

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2
Offline support: Partial (queue confirmation)
Latency tolerance: < 250ms scan feedback

# 10. Device / Hardware Context
Scanner type: Hardware preferred
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes on failed scan

# 11. Navigation Rules
Entry point: Dispatch task from queue
Exit path: MOB-003
Back behavior: Warn on incomplete manifest
Deep links (if any): Dispatch alert deep link

# 12. Edge Cases
- Vehicle changed during loading
- Partial loading allowed due to capacity
- Last-minute shipment cancellation

# 13. Notes for Designer (Optional but powerful)
- Fast repetitive scanning should remain frictionless
- Keep loaded/progress indicator constantly visible
