# 1. Screen Overview
Screen ID: ADM-002
Name: Zone Shelf Bin Designer
Primary Persona: System Admin

Goal of Screen (1 line): Configure and govern platform behavior for reliable operations and compliance.

What should the user accomplish here?
- Complete administrative setup or governance action with safe validation and clear impact.

# 2. Primary Action (Critical)
Main CTA: Save Configuration
Success condition: Configuration validates and publishes without policy conflicts.
What happens after success:
- Changes are versioned, audited, and propagated to relevant modules/connectors.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Create hierarchy nodes
- Bulk import location tree
- Set zone classes
🟡 Secondary (visible but less prominent)
- Hierarchy tree visualization
- Node capacities and occupancy
- Validation errors on structure
⚪ Tertiary (hidden / expandable)
- Version history and diffs
- Audit metadata
- Diagnostics and logs

# 4. Layout Structure (Wireframe in words)
Header: Screen title, environment scope, save/publish actions
Body: Configuration workspace (form/table/tree/canvas)
Footer / Sticky CTA: Save or Publish
Floating elements: Validation panel, impact preview

# 5. Interaction Model
Tap actions: Add/edit/delete config rows, run validation, publish
Swipe actions: Not applicable
Scan behavior: Not applicable
Auto-navigation rules: Stay on screen after save and show change summary

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Section skeletons and disabled destructive actions |
| Empty | Getting-started guidance + create CTA |
| Error | Inline validation + blocking summary panel |
| Success | Success toast + version/audit reference |

# 7. Error Handling (Important for ops apps)
Error type: Policy conflict
User feedback: Red conflict banner with impacted entities
Recovery action: Adjust configuration or request override

Error type: Publish/deploy failure
User feedback: Error toast with rollback status
Recovery action: Retry publish or revert to previous version

# 8. Visual Priority & Cues
🔴 Red = breaking config risk
🟡 Yellow = warning / soft conflict
🟢 Green = valid and published
🔵 Blue = editable/actionable controls

Also define:
- Badge usage: Draft, Published, Deprecated
- Icon expectations: settings, policy, audit, connector

# 9. Performance & UX Constraints
One-handed usage: No
Max steps to complete task: 4
Offline support: No
Latency tolerance: < 500ms form interactions, < 3s publish feedback

# 10. Device / Hardware Context
Scanner type: None
Gloves usage: No
Sound feedback: No
Vibration: No

# 11. Navigation Rules
Entry point: Admin left nav
Exit path: Related admin module or audit screen
Back behavior: Prompt on unsaved changes
Deep links (if any): Version IDs, entity IDs, validation findings

# 12. Edge Cases
- Concurrent admin edits
- Partial import success
- Permission downgrade during edit
- Invalid legacy configuration detected

# 13. Notes for Designer (Optional but powerful)
- Prevent accidental destructive actions
- Make validation and impact visibility first-class
- Optimize for confidence and auditability
