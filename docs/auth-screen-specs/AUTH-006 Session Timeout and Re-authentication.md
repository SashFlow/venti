# 1. Screen Overview
Screen ID: AUTH-006
Name: Session Timeout and Re-authentication
Primary Persona: All authenticated users with idle or expiring sessions

Goal of Screen (1 line): Warn users of impending session expiration and allow them to extend session or re-authenticate without losing work context.

What should the user accomplish here?
- Choose to extend their session if still active, or re-authenticate if session has expired, while preserving unsaved work where possible.

# 2. Primary Action (Critical)
Main CTA: Extend Session (if warning phase) / Sign In Again (if expired phase)
Success condition: User clicks Extend Session and session refreshed, OR user re-enters credentials successfully.
What happens after success:
- Session is extended/renewed, modal closes, user continues work without interruption. If re-authentication required, user returns to exact screen they were on with state preserved.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Countdown timer (e.g., "Your session will expire in 2:45"), Extend Session button (warning phase) or Password input + Sign In button (expired phase)
🟡 Secondary (visible but less prominent)
- User email/identifier, Session duration information, "Save work and sign out" option, Explanation text ("You've been inactive for...")
⚪ Tertiary (hidden / expandable)
- Auto-save status (if applicable), Security policy information, Last activity timestamp

# 4. Layout Structure (Wireframe in words)
Header: Warning/error icon, modal title "Session Expiring Soon" or "Session Expired"
Body: Centered modal (max-width 400px, cannot be dismissed by clicking outside) with countdown or explanation, re-auth form if expired, action buttons
Footer / Sticky CTA: Extend Session / Sign In Again button (primary), Sign Out button (secondary)
Floating elements: Modal overlay (semi-transparent, blocks interaction with page behind), toast notification before modal appears (optional)

# 5. Interaction Model
Tap actions: Click Extend Session, click Sign Out, enter password and click Sign In (if expired), click "Continue" after re-auth
Swipe actions: None (modal prevents page interaction)
Scan behavior: Not applicable
Auto-navigation rules: Modal appears 2 minutes before expiration (configurable), auto-sign-out after countdown reaches zero if no action taken, auto-close modal and resume work after successful session extension

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Warning | Countdown timer visible, Extend Session button enabled, non-urgent yellow/orange styling |
| Critical | Countdown under 30 seconds, pulsing or animated attention-grabber, urgent red styling |
| Expired | Countdown replaced with "Session Expired" message, password re-auth form shown, cannot extend |
| Re-authenticating | Spinner on Sign In button, form disabled during auth |
| Success | Brief checkmark animation, modal fades out, user returns to previous context |

# 7. Error Handling (Important for ops apps)
Error type: Network failure during session extension
User feedback: Red text "Unable to extend session. Please check your connection."
Recovery action: Retry button, keep modal open, preserve countdown

Error type: Session already expired before extension attempt
User feedback: Modal updates to expired state "Your session has expired. Please sign in again."
Recovery action: Show re-authentication form

Error type: Invalid password during re-auth
User feedback: Red text below password field "Incorrect password. Please try again."
Recovery action: Clear password field, maintain focus, show forgot password link if 2+ failed attempts

Error type: Account locked during re-auth
User feedback: Red banner "Your account has been locked. Please contact support."
Recovery action: Disable form, show support contact, force full sign-out

Error type: Unsaved work present when expired
User feedback: Warning icon + text "You have unsaved changes. Save work before signing in?"
Recovery action: Offer "Save Draft" button if applicable, or warn about data loss

# 8. Visual Priority & Cues
- Red: session expired, critical countdown (< 30s), authentication errors
- Yellow/Orange: session expiring soon (warning phase)
- Green: session successfully extended
- Blue: Extend Session button, Sign In button
- Badge usage: "Auto-saved" badge if work was preserved, "Unsaved Changes" warning badge
- Icon expectations: clock/timer icon, warning triangle, lock for re-auth, checkmark for success, wifi/connection icon for network status

# 9. Performance & UX Constraints
One-handed usage: No (modal requires focused interaction)
Max steps to complete task: 1 (click Extend) or 2 (enter password → sign in)
Offline support: Limited - modal may appear but cannot extend session or re-auth without network
Latency tolerance: < 500ms for session extension, < 2s for re-authentication

# 10. Device / Hardware Context
Scanner type: None
Gloves usage: No
Sound feedback: Optional alert sound when modal appears (especially for critical phase)
Vibration: Optional on mobile devices

# 11. Navigation Rules
Entry point: Automatic trigger based on session idle timeout or max session duration policy
Exit path: Returns to exact screen user was on before modal appeared (state preserved)
Back behavior: Disabled (modal is blocking, must be resolved)
Deep links (if any): Not applicable (modal overlay, not separate route)

# 12. Edge Cases
- User active in multiple tabs/windows (extend in one tab should extend all)
- User working in form with unsaved data (attempt to preserve, show warning)
- Session expires while user is typing (detect activity, show warning earlier)
- Network disconnects during countdown (pause countdown, show network error, resume when reconnected)
- User closes modal without action (treat as idle, proceed with expiration)
- Session timeout happens during critical operation (save/transaction) - attempt to complete operation before sign-out
- MFA required during re-authentication (redirect to AUTH-005 after password verification)
- Admin extends session duration policy while modal is open (update countdown dynamically)
- User in offline mode when session expires (queue re-auth, trigger when online)
- Multiple rapid session refresh attempts (prevent, show single extend request)
- Session expired on backend but countdown still active on frontend (sync check, immediate expiration)

# 13. Notes for Designer (Optional but powerful)
- Modal should be impossible to dismiss accidentally (no outside click to close)
- Use color progression: yellow → orange → red as time decreases
- Clear, non-alarming language for warning phase
- Countdown should be large and clearly visible
- Consider adding a "Stay signed in" checkbox to remember user preference
- If unsaved work exists, make it VERY clear before forcing sign-out
- Password field should be pre-filled with user email (for context)
- Support password manager auto-fill for quick re-auth
- Keyboard accessibility: Enter key should extend session or submit re-auth
- Consider showing "last activity" timestamp for user awareness
- On mobile, ensure modal doesn't push critical buttons below fold
- Add optional browser notification permission request for session warnings (especially for background tabs)
- Consider audio alert for critical phase (< 30s) if user granted notification permission
