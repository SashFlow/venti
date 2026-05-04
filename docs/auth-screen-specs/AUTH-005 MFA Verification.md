# 1. Screen Overview
Screen ID: AUTH-005
Name: MFA Verification
Primary Persona: All users with MFA enabled at login time

Goal of Screen (1 line): Verify user identity by requiring a second factor (6-digit code from authenticator app) after successful password authentication.

What should the user accomplish here?
- Enter 6-digit verification code from their authenticator app to complete login, with option to trust device for future logins.

# 2. Primary Action (Critical)
Main CTA: Verify Code
Success condition: Valid 6-digit code entered and verified against server.
What happens after success:
- Session is fully authenticated, device trust optionally saved, user redirected to workspace selection (if multiple workspaces) or default dashboard.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- 6-digit code input field (large, centered), Verify button, User email/identifier for context
🟡 Secondary (visible but less prominent)
- "Trust this device for 30 days" checkbox, "Use backup code instead" link, Resend code option (if SMS-based, otherwise N/A), Time-based code expiration indicator
⚪ Tertiary (hidden / expandable)
- "Lost access to authenticator?" help link, Security note about device trust, Back to login link

# 4. Layout Structure (Wireframe in words)
Header: Back arrow to login, security badge indicator
Body: Centered card (max-width 400px) with heading "Two-Factor Authentication", user identifier, 6-digit input (separate boxes or single field), trust device checkbox, verify button
Footer / Sticky CTA: Verify button inside card, help links below card
Floating elements: Loading spinner overlay during verification, error toast for failed attempts

# 5. Interaction Model
Tap actions: Enter 6-digit code, click Verify, toggle trust device checkbox, click backup code link, click back to login
Swipe actions: None
Scan behavior: Not applicable (user reads code from separate authenticator app)
Auto-navigation rules: Auto-submit when 6 digits are entered (optional UX pattern), auto-redirect on successful verification

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Spinner on Verify button, input disabled during verification |
| Empty | Clean 6-digit input ready for code entry, auto-focus first digit |
| Error | Red shake animation, error message below input, code cleared after 3 failed attempts |
| Success | Green checkmark animation, brief success message, immediate redirect |

# 7. Error Handling (Important for ops apps)
Error type: Invalid code
User feedback: Red text below input "Invalid code. Please try again." + shake animation
Recovery action: Clear input, focus back on first digit, show remaining attempts if applicable

Error type: Code expired
User feedback: Orange warning "This code has expired. Please use the latest code from your authenticator app."
Recovery action: Clear input, allow new code entry

Error type: Too many failed attempts
User feedback: Red banner "Too many failed attempts. Your account has been temporarily locked for 15 minutes."
Recovery action: Disable form, show countdown timer, offer backup code option, show contact admin link

Error type: Network error
User feedback: Red banner "Unable to verify code. Please check your connection."
Recovery action: Retry button, keep entered code

Error type: Account locked during verification
User feedback: Red banner "Your account has been locked. Please contact support."
Recovery action: Show support contact info, disable further attempts

# 8. Visual Priority & Cues
- Red: verification failure, account lock, critical errors
- Yellow: approaching rate limit, code expiration warning
- Green: successful verification, valid code accepted
- Blue: primary CTA (Verify), trust device checkbox, backup code link
- Badge usage: Security indicator badge, "Trusted Device" badge if applicable
- Icon expectations: shield for security, lock for MFA, checkmark for success, warning triangle for errors, clock for time-sensitive codes

# 9. Performance & UX Constraints
One-handed usage: Limited (requires switching between devices - phone for code, computer/tablet for entry)
Max steps to complete task: 1 (enter code → verify)
Offline support: No (requires server verification)
Latency tolerance: < 500ms for code verification response

# 10. Device / Hardware Context
Scanner type: None (visual code reading from separate device)
Gloves usage: No
Sound feedback: Optional success/error sounds
Vibration: Optional on mobile

# 11. Navigation Rules
Entry point: Automatically triggered after successful password authentication on AUTH-001 if MFA is enabled
Exit path: Workspace selector or role-appropriate dashboard after successful verification
Back behavior: Returns to AUTH-001 (Sign In), clears partial authentication session
Deep links (if any): Cannot deep link past MFA verification (security requirement)

# 12. Edge Cases
- User lost access to authenticator app (provide backup code option, link to account recovery)
- Code is correct but validation fails (server-side issue, show generic error, log for investigation)
- User's device clock is out of sync (causes TOTP codes to fail, suggest time sync in error message)
- User tries to reuse old code (reject with "expired code" message)
- Multiple rapid submission attempts (implement rate limiting, show warning)
- User switches devices mid-verification (session remains valid, can continue)
- Trust device checkbox selected but browser blocks cookies (show warning, proceed without trust)
- Backup code used successfully (remind user to regenerate codes from account settings)
- User closes tab during verification (partial auth session expires, must restart login)
- Admin resets user's MFA while user is on verification screen (show clear error, redirect to login)

# 13. Notes for Designer (Optional but powerful)
- Large, easy-to-tap input fields (especially for 6-digit separate boxes)
- Auto-advance between digit boxes for smooth UX (if using separate boxes)
- Consider auto-submit when 6 digits entered (no need to click Verify)
- Clear visual feedback for each digit entered
- Paste support from clipboard (for users copying codes)
- Show user identifier (email/username) for context, especially if shared device
- Trust device option should be clear about duration (30 days)
- Prominent backup code fallback option
- Add subtle animation to indicate waiting for code entry
- Support number pad keyboards on mobile devices
- Clear distinction between "invalid code" vs "expired code" vs "rate limited"
- Consider showing last successful login info for security awareness
