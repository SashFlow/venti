# 1. Screen Overview
Screen ID: MOB-020
Name: Return Inspection Capture
Primary Persona: QC Inspector

Goal of Screen (1 line): Execute return inspection template and capture disposition recommendation.

What should the user accomplish here?
- Produce a complete, auditable inspection result with evidence.

# 2. Primary Action (Critical)
Main CTA: Submit Inspection Outcome
Success condition: Checklist complete, evidence captured, disposition selected.
What happens after success:
- Item routed to restock/refurbish/scrap/RTV workflow.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Inspection checklist status, selected disposition, Submit CTA
🟡 Secondary (visible but less prominent)
- Warranty eligibility, defect category
⚪ Tertiary (hidden / expandable)
- Notes, attachments metadata, prior inspections

# 4. Layout Structure (Wireframe in words)
Header: Return item and case ID
Body: Checklist sections + photo/note capture panel
Footer / Sticky CTA: Submit Outcome
Floating elements: Add photo quick action

# 5. Interaction Model
Tap actions: Mark pass/fail, add notes/photos, choose disposition, submit
Swipe actions: Navigate checklist sections
Scan behavior: Optional serial revalidation scan
Auto-navigation rules: On submit, case closes and next inspection opens

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Checklist skeleton |
| Empty | No inspection points configured |
| Error | Missing mandatory evidence errors |
| Success | Outcome confirmation + route hint |

# 7. Error Handling (Important for ops apps)
Error type: Mandatory checkpoint incomplete
User feedback: Red section highlight
Recovery action: Complete missing checks

Error type: Disposition restricted by policy
User feedback: Blocking modal
Recovery action: Select allowed disposition or escalate

# 8. Visual Priority & Cues
- Red: failed critical checkpoint
- Yellow: conditional accept path
- Green: accepted/complete
- Blue: actionable checklist controls
- Badge usage: Warranty eligible, critical defect
- Icon expectations: checklist, camera, decision tree

# 9. Performance & UX Constraints
One-handed usage: Partial (often two-hand photo capture)
Max steps to complete task: 5
Offline support: Partial (media queued)
Latency tolerance: < 500ms for checklist interactions

# 10. Device / Hardware Context
Scanner type: Optional serial scan
Gloves usage: Yes
Sound feedback: Optional
Vibration: Yes on submission block

# 11. Navigation Rules
Entry point: MOB-019 or QC queue
Exit path: Next inspection or task queue
Back behavior: Save-draft prompt before exit
Deep links (if any): QC case deep link

# 12. Edge Cases
- Poor image capture quality
- Conflicting checklist outcomes
- Warranty status unresolved due to missing data

# 13. Notes for Designer (Optional but powerful)
- Evidence capture must be prominent but fast
- Keep disposition choice clear and auditable
