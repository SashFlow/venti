# 1. Screen Overview
Screen ID: AUTH-001
Name: Web Login and Workspace Selection
Primary Persona: All web users (Operations Manager, Supervisor, Planner, Admin, Analyst)

Goal of Screen (1 line): Authenticate user via credentials or SSO and bind session to correct workspace and role context.

What should the user accomplish here?
- Sign in securely using email/password or SSO provider and select the appropriate workspace context for their session.

# 2. Primary Action (Critical)
Main CTA: Sign In / Continue with SSO
Success condition: Valid credentials + workspace selected + session established.
What happens after success:
- User lands on their default dashboard (role-dependent: Control Tower for ops, Admin panel for admins, Analytics for analysts).

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Email and password input fields, Sign In button, SSO provider buttons (if configured), Workspace selector dropdown
🟡 Secondary (visible but less prominent)
- "Forgot password?" link, "Remember me" checkbox, Terms and Privacy links, SSO provider logos
⚪ Tertiary (hidden / expandable)
- Browser/device fingerprint metadata, IP geolocation, session security notes, version/build number in footer

# 4. Layout Structure (Wireframe in words)
Header: Company/product logo, language selector
Body: Centered login card (max-width 420px) with email/password form OR SSO buttons, workspace dropdown appears after successful authentication
Footer / Sticky CTA: Sign In button inside card, legal links in page footer
Floating elements: Toast notifications for errors, loading overlay during authentication

# 5. Interaction Model
Tap actions: Click Sign In, click SSO provider button, select workspace, click Forgot Password
Swipe actions: None
Scan behavior: Not applicable
Auto-navigation rules: After successful authentication, auto-show workspace selector if user has access to multiple workspaces; auto-navigate if single workspace

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Spinner on Sign In button, form disabled during auth request |
| Empty | Clean login form ready for input |
| Error | Red banner above form with error message, field-level validation errors |
| Success | Brief success checkmark animation, fade to workspace selector or dashboard |

# 7. Error Handling (Important for ops apps)
Error type: Invalid credentials
User feedback: Red banner "Invalid email or password" with error icon
Recovery action: Clear password field, focus on password input, show "Forgot password?" link prominently

Error type: Account locked/suspended
User feedback: Orange warning banner with lock icon and contact admin message
Recovery action: Show support email/link, prevent further login attempts

Error type: Network/server error
User feedback: Red banner "Unable to connect. Please try again."
Recovery action: Retry button, check network connection prompt

Error type: MFA required
User feedback: Auto-redirect to MFA verification screen (AUTH-005)
Recovery action: Allow user to go back and re-enter credentials

Error type: Workspace access denied
User feedback: Red banner "You don't have access to any workspaces"
Recovery action: Contact admin CTA, sign out option

# 8. Visual Priority & Cues
- Red: authentication errors, account lock, critical issues
- Yellow: warnings, pending verification
- Green: successful authentication, verified status
- Blue: primary CTA (Sign In), SSO provider buttons, actionable links
- Badge usage: "SSO Enabled" badge if configured, "Beta" badge for new features
- Icon expectations: lock/security icon, email icon, eye icon for password visibility toggle, SSO provider logos

# 9. Performance & UX Constraints
One-handed usage: No (desktop/tablet focused)
Max steps to complete task: 2-3 (credentials → workspace select → dashboard)
Offline support: No (online authentication required)
Latency tolerance: < 300ms for field validation, < 2s for authentication response, < 1s for workspace list load

# 10. Device / Hardware Context
Scanner type: None (optional QR code scanner for SSO setup)
Gloves usage: No
Sound feedback: No
Vibration: No

# 11. Navigation Rules
Entry point: Root URL (/), session expiration redirect, logout action
Exit path: Role-appropriate dashboard (WEB-001 for ops, ADM-001 for admins, ANL-001 for analysts)
Back behavior: Disabled on login screen (no previous page in session)
Deep links (if any): SSO callback URLs, invitation acceptance redirect, password reset redirect

# 12. Edge Cases
- User has no assigned workspace (show contact admin message)
- User assigned to 10+ workspaces (search/filter in workspace selector)
- Session token expired during workspace selection (re-authenticate transparently)
- SSO provider timeout or error (fallback to credential login option)
- Browser autofill conflicts with validation (handle gracefully)
- Concurrent login from another device (allow or show warning based on policy)
- First-time login requiring password change (redirect to AUTH-007)
- Invitation token in URL (auto-redirect to AUTH-008 after authentication)

# 13. Notes for Designer (Optional but powerful)
- Keep login form minimal and distraction-free
- Large, accessible form fields (min 44px touch target)
- Clear visual hierarchy between primary login and secondary actions
- Support password managers (proper autocomplete attributes)
- Accessible focus states for keyboard navigation
- Consider dark mode for late-shift operations users
- SSO buttons should be visually distinct from regular form submission
- Workspace selector should show warehouse icons/codes for quick recognition
