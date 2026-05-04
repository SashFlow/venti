# 1. Screen Overview
Screen ID: AUTH-003
Name: Password Reset Page
Primary Persona: Users who clicked reset link from email

Goal of Screen (1 line): Allow users to securely set a new password using a time-limited token from their email.

What should the user accomplish here?
- Create a strong new password and regain access to their account.

# 2. Primary Action (Critical)
Main CTA: Reset Password
Success condition: Valid token + new password meets strength requirements + passwords match + successfully saved.
What happens after success:
- User sees success confirmation and is automatically redirected to login screen (AUTH-001) after 3 seconds or can click to proceed immediately.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- New password input field (with visibility toggle), Confirm password input field, Password strength indicator, Reset Password button
🟡 Secondary (visible but less prominent)
- Password requirements list (8+ chars, uppercase, lowercase, number, special char), "Show/Hide" password toggles
⚪ Tertiary (hidden / expandable)
- Token expiration warning, security best practices tip, last password change timestamp

# 4. Layout Structure (Wireframe in words)
Header: Company logo, security badge/indicator
Body: Centered card (max-width 420px) with heading "Create New Password", password requirements, two password fields with strength meter, submit button
Footer / Sticky CTA: Reset Password button inside card
Floating elements: Success modal or toast, token expiration warning banner if approaching expiry

# 5. Interaction Model
Tap actions: Type new password, toggle password visibility, click Reset Password, click "Go to Sign In" after success
Swipe actions: None
Scan behavior: Not applicable
Auto-navigation rules: Auto-redirect to AUTH-001 after 3 seconds on success (with option to skip wait)

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Spinner on button, form disabled during save |
| Empty | Clean form with first password field focused, requirements shown |
| Error | Red validation errors below fields, red banner for token errors |
| Success | Green success modal/banner with checkmark, countdown to redirect |

# 7. Error Handling (Important for ops apps)
Error type: Invalid or expired token
User feedback: Red banner "This reset link has expired or is invalid. Please request a new one."
Recovery action: Button to return to AUTH-002 (Forgot Password)

Error type: Password too weak
User feedback: Red text below field "Password does not meet requirements" + strength meter shows weak
Recovery action: Update password requirements dynamically as user types

Error type: Passwords don't match
User feedback: Red text below confirm field "Passwords do not match"
Recovery action: Clear confirm field, focus back on it

Error type: Password same as old password
User feedback: Orange warning "Please choose a different password than your previous one"
Recovery action: Clear both fields, prompt for new password

Error type: Network error during save
User feedback: Red banner "Unable to reset password. Please try again."
Recovery action: Retry button, form remains filled

Error type: Token already used
User feedback: Red banner "This reset link has already been used. Please request a new one if needed."
Recovery action: Button to return to AUTH-002

# 8. Visual Priority & Cues
- Red: validation errors, expired token, weak password
- Yellow: moderate password strength, approaching token expiration
- Green: strong password, successful reset, valid token
- Blue: primary CTA, visibility toggles, actionable links
- Badge usage: Strength indicator badges (Weak/Fair/Good/Strong)
- Icon expectations: lock icon, eye/eye-slash for visibility toggle, checkmark for met requirements, X for unmet requirements, shield for security

# 9. Performance & UX Constraints
One-handed usage: No (desktop/tablet focused)
Max steps to complete task: 2 (enter password + confirm → submit)
Offline support: No (requires server validation)
Latency tolerance: < 300ms for strength meter update, < 2s for password save

# 10. Device / Hardware Context
Scanner type: None
Gloves usage: No
Sound feedback: No
Vibration: No

# 11. Navigation Rules
Entry point: Email reset link with token parameter
Exit path: AUTH-001 (Sign In) after successful reset
Back behavior: Warn about losing progress, confirm before leaving
Deep links (if any): Reset URL with token query parameter (e.g., /auth/reset?token=xxx)

# 12. Edge Cases
- Token expired during password entry (validate on submit, show clear error)
- User navigates away mid-flow (token remains valid until used or expired)
- Password meets requirements but server rejects (e.g., matches recent passwords in history)
- Caps Lock is on (show warning indicator)
- User tries to reuse same token twice (second attempt fails with "already used" error)
- Token was invalidated by newer reset request (show appropriate message)
- Browser autofill suggests old password (block or warn)
- User leaves tab open for hours, token expires (detect on focus/submit, show clear message)

# 13. Notes for Designer (Optional but powerful)
- Real-time password strength feedback as user types
- Visual checkmarks for each met requirement (dynamic)
- Clear, non-technical error messages
- Password visibility toggle on both fields
- Prevent paste in confirm password field (or allow, depending on security policy)
- Show token expiration time if possible (e.g., "Valid for 15 more minutes")
- Success state should feel secure and reassuring
- Consider showing password generation suggestion for strong passwords
- Accessible color contrast for strength indicators (don't rely on color alone)
