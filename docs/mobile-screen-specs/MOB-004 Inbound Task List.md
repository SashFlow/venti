# 1. Screen Overview
Screen ID: MOB-004
Name: Inbound Task List
Primary Persona: Floor Operator

Goal of Screen (1 line): Find and start receiving tasks quickly by shipment/PO/GRN context.

What should the user accomplish here?
- Locate the right inbound workload and begin receiving with confidence.

# 2. Primary Action (Critical)
Main CTA: Start Receiving Session
Success condition: Selected inbound task enters active receiving mode.
What happens after success:
- Navigate to MOB-005 with context preloaded.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- GRN/PO reference, supplier, pending lines, Start action
🟡 Secondary (visible but less prominent)
- Dock, ETA, completion percent, QC-required flag
⚪ Tertiary (hidden / expandable)
- Supplier notes, appointment metadata

# 4. Layout Structure (Wireframe in words)
Header: Search box + filters
Body: Inbound task cards grouped by due time
Footer / Sticky CTA: Start Receiving (enabled on selection)
Floating elements: Scan icon for PO/GRN quick search

# 5. Interaction Model
Tap actions: Search, select task, open details, start session
Swipe actions: Quick pin or mark urgent
Scan behavior: Scan PO/ASN barcode to locate task
Auto-navigation rules: Selected task opens MOB-005 automatically

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Card skeletons with shimmer |
| Empty | No inbound tasks + clear filter CTA |
| Error | Inline error row + retry |
| Success | Highlight selected task and transition |

# 7. Error Handling (Important for ops apps)
Error type: Task already in progress by another user
User feedback: Yellow lock banner
Recovery action: View-only mode or request handover

Error type: Unknown scanned reference
User feedback: Red toast + beep
Recovery action: Retry scan or manual search

# 8. Visual Priority & Cues
- Red: overdue inbound tasks
- Yellow: approaching SLA
- Green: completed tasks
- Blue: selected card/actions
- Badge usage: QC required, high priority
- Icon expectations: dock, supplier, shipment

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 2
Offline support: Partial cached list
Latency tolerance: < 300ms search response, < 1s transition

# 10. Device / Hardware Context
Scanner type: Camera/hardware
Gloves usage: Yes
Sound feedback: Yes for scan result
Vibration: Yes on scan failure

# 11. Navigation Rules
Entry point: MOB-003 task queue
Exit path: MOB-005
Back behavior: Back returns to queue retaining filters
Deep links (if any): PO/GRN deep link from alerts

# 12. Edge Cases
- Duplicate GRN references across sites
- Task partially completed by previous shift
- Dock assignment changed post-creation

# 13. Notes for Designer (Optional but powerful)
- Minimize typing with scan-first search
- Emphasize due-time urgency
- Keep filter chips quickly reachable
