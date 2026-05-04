# 1. Screen Overview
Screen ID: MOB-002
Name: Shift Start and Device Health
Primary Persona: Floor Operator, QC Inspector

Goal of Screen (1 line): Confirm user readiness, hardware readiness, and safety checklist before task execution.

What should the user accomplish here?
- Start shift only when scanner/printer/network checks pass.

# 2. Primary Action (Critical)
Main CTA: Start Shift
Success condition: Mandatory checks complete with acceptable status.
What happens after success:
- User is routed to task queue home (MOB-003).

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Shift start status, scanner status, Start Shift CTA
🟡 Secondary (visible but less prominent)
- Battery level, network strength, printer test result
⚪ Tertiary (hidden / expandable)
- Diagnostic logs, firmware details

# 4. Layout Structure (Wireframe in words)
Header: User, site, shift time window
Body: Health check cards + safety checklist
Footer / Sticky CTA: Start Shift
Floating elements: Critical alert banner

# 5. Interaction Model
Tap actions: Run tests, check safety items, start shift
Swipe actions: Dismiss informational tips
Scan behavior: Test scan required (single test code)
Auto-navigation rules: On success, auto-open MOB-003

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Card-level skeletons |
| Empty | No required checks configured message |
| Error | Inline fail state on check card |
| Success | Green check summary and proceed |

# 7. Error Handling (Important for ops apps)
Error type: Scanner unavailable
User feedback: Red hardware card + beep
Recovery action: Reconnect scanner or fallback to camera mode

Error type: Battery critical
User feedback: Blocking warning modal
Recovery action: Prompt to dock/replace device

# 8. Visual Priority & Cues
- Red: failed mandatory checks
- Yellow: warning but not blocking
- Green: pass
- Blue: run test actions
- Badge usage: Check status badges
- Icon expectations: battery, wifi, scanner, printer

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 4
Offline support: Partial (local checks only)
Latency tolerance: < 300ms on health status refresh

# 10. Device / Hardware Context
Scanner type: Hardware or camera fallback
Gloves usage: Yes
Sound feedback: Yes
Vibration: Yes

# 11. Navigation Rules
Entry point: MOB-001 success
Exit path: MOB-003
Back behavior: Back returns to sign-in confirmation
Deep links (if any): Device diagnostics link

# 12. Edge Cases
- Hardware test intermittently fails
- Shift already started on another device
- Site changes after login

# 13. Notes for Designer (Optional but powerful)
- Speed over aesthetics
- Clear pass/fail affordances
- Large toggles and check targets
