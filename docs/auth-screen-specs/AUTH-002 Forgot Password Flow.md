# 1. Screen Overview
Screen ID: AUTH-002
Name: Forgot Password Flow
Primary Persona: All users who need password recovery

Goal of Screen (1 line): Allow users to securely request a password reset link via email.

What should the user accomplish here?
- Enter their registered email address and receive instructions to reset their password.

# 2. Primary Action (Critical)
Main CTA: Send Reset Link
Success condition: Valid email submitted and reset email sent successfully.
What happens after success:
- User sees confirmation message and is instructed to check email; email contains time-limited reset token link.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Email input field, Send Reset Link button, instruction text
🟡 Secondary (visible but less prominent)
- "Back to Sign In" link, "Didn't receive email?" help text, estimated delivery time (2-5 minutes)
⚪ Tertiary (hidden / expandable)
- Rate limiting info, security notes about token expiration, spam folder reminder

# 4. Layout Structure (Wireframe in words)
Header: Company logo, back arrow to login
Body: Centered card (max-width 420px) with clear heading "Reset Your Password", instruction paragraph, email input, send button
Footer / Sticky CTA: Send Reset Link button inside card
Floating elements: Success/error toast notifications

# 5. Interaction Model
Tap actions: Enter email, click Send Reset Link, click Back to Sign In, click resend (if available)
Swipe actions: None
Scan behavior: Not applicable
Auto-navigation rules: After successful submission, show success state but keep user on page (don't auto-navigate)

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Spinner on button, form disabled during request |
| Empty | Clean form with email input focused |
| Error | Red inline error below email field or banner at top |
| Success | Green success banner with checkmark, email input replaced with confirmation message |

# 7. Error Handling (Important for ops apps)
Error type: Invalid email format
User feedback: Red text below field "Please enter a valid email address"
Recovery action: Fix email format, resubmit

Error type: Email not found
User feedback: Generic success message (security best practice: don't reveal if email exists)
Recovery action: User should contact admin if persistent issue

Error type: Rate limit exceeded
User feedback: Orange warning "Too many requests. Please wait 15 minutes and try again."
Recovery action: Show countdown timer, disable form temporarily

Error type: Network error
User feedback: Red banner "Unable to send reset link. Please check your connection."
Recovery action: Retry button

# 8. Visual Priority & Cues
- Red: validation errors, network failures
- Yellow: rate limit warnings, informational notices
- Green: successful submission
- Blue: primary CTA, back to login link
- Badge usage: None typically
- Icon expectations: email/envelope icon, lock icon for security, checkmark for success, info icon for help text

# 9. Performance & UX Constraints
One-handed usage: No (desktop/tablet focused)
Max steps to complete task: 2 (enter email → submit)
Offline support: No (requires server communication)
Latency tolerance: < 2s for submission response

# 10. Device / Hardware Context
Scanner type: None
Gloves usage: No
Sound feedback: No
Vibration: No

# 11. Navigation Rules
Entry point: "Forgot password?" link from AUTH-001 or MOB-001
Exit path: Back to AUTH-001 (Sign In) or forward to AUTH-003 (Password Reset) via email link
Back behavior: Returns to login screen (AUTH-001)
Deep links (if any): Direct URL for password reset request page

# 12. Edge Cases
- User submits email not in system (show generic success for security)
- User already has pending reset token (invalidate old token, send new one)
- Email delivery fails (server logs error but shows success to user)
- User tries to reset locked/suspended account (show generic success, admin notified)
- Multiple rapid submissions (rate limiting kicks in)
- User clicks reset link after new request (only latest token is valid)
- Typo in email address (user won't receive email, must re-request)

# 13. Notes for Designer (Optional but powerful)
- Use reassuring, clear language to reduce user anxiety
- Don't reveal whether email exists in system (security best practice)
- Make success state actionable (remind to check spam, show estimated delivery time)
- Include helpful next steps in success message
- Consider adding "Resend" option after 5 minutes
- Support paste from clipboard for email field
- Clear focus state for accessibility
