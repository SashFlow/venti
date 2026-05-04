# 1. Screen Overview
Screen ID: MOB-001
Name: Login and Site Selection
Primary Persona: All mobile users

Goal of Screen (1 line): Authenticate user and bind session to correct warehouse and role.

What should the user accomplish here?
- Sign in quickly and choose the right site/role context before shift work begins.

# 2. Primary Action (Critical)
Main CTA: Continue to Shift Start
Success condition: Valid credentials + site selected + role context resolved.
What happens after success:
- User lands on shift start and device health screen.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Sign-in form, site selector, role selector, Continue CTA
🟡 Secondary (visible but less prominent)
- Last login, timezone, shift code
⚪ Tertiary (hidden / expandable)
- Device trust metadata, legal/session notes

# 4. Layout Structure (Wireframe in words)
Header: App logo, language switch, support shortcut
Body: Credential form then site/role picker (progressive)
Footer / Sticky CTA: Continue button
Floating elements: Network status chip

# 5. Interaction Model
Tap actions: Sign in, select site, select role, continue
Swipe actions: None
Scan behavior: Not applicable
Auto-navigation rules: Auto-advance to site selection after valid sign-in

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Full-screen spinner during auth |
| Empty | No assigned site message + contact admin CTA |
| Error | Inline form errors + top toast |
| Success | Short success toast then navigate forward |

# 7. Error Handling (Important for ops apps)
Error type: Invalid credentials
User feedback: Red inline error + subtle vibration
Recovery action: Retry credentials or forgot password

Error type: Account locked
User feedback: Modal with lock reason
Recovery action: Contact admin flow

# 8. Visual Priority & Cues
- Red: auth failure/lock
- Yellow: partial profile missing
- Green: successful authentication
- Blue: selectable site/role and CTA
- Badge usage: Role badges
- Icon expectations: lock, warehouse, user-role

# 9. Performance & UX Constraints
One-handed usage: Yes
Max steps to complete task: 3
Offline support: No (online auth required)
Latency tolerance: < 500ms for field validation, < 2s for login response

# 10. Device / Hardware Context
Scanner type: None
Gloves usage: No
Sound feedback: Optional
Vibration: Yes for failure

# 11. Navigation Rules
Entry point: App launch/session expired
Exit path: MOB-002
Back behavior: Disabled on auth screen
Deep links (if any): SSO invite link

# 12. Edge Cases
- No network
- User assigned to multiple roles and sites
- Session token expired mid-flow

# 13. Notes for Designer (Optional but powerful)
- Minimize typing
- Keep form fields large and thumb-friendly
- Prioritize clarity over decoration
