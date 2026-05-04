# 1. Screen Overview
Screen ID: AUTH-004
Name: MFA Enrollment
Primary Persona: All users setting up multi-factor authentication for the first time

Goal of Screen (1 line): Guide users through enabling MFA using an authenticator app and provide backup recovery codes.

What should the user accomplish here?
- Scan QR code with authenticator app, verify setup with test code, and securely save backup codes.

# 2. Primary Action (Critical)
Main CTA: Verify and Enable MFA
Success condition: QR code scanned + valid verification code entered + backup codes acknowledged.
What happens after success:
- MFA is enabled on account, backup codes are displayed for download/print, user redirected to AUTH-007 (Account Settings) or dashboard with success confirmation.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- QR code display, 6-digit verification code input field, Verify button, Step indicator (1 of 3, 2 of 3, etc.)
🟡 Secondary (visible but less prominent)
- Instructions for each step, Manual entry code (alternative to QR), Supported authenticator app list, "Skip for now" option (if allowed by policy)
⚪ Tertiary (hidden / expandable)
- Security best practices, Why MFA is important explanation, Troubleshooting help link, Policy requirements note

# 4. Layout Structure (Wireframe in words)
Header: Progress indicator (Step 1 of 3), Close/Back button
Body: Centered card (max-width 480px) with step-based flow:
  - Step 1: Install authenticator app (instructions + app store links)
  - Step 2: Scan QR code (large QR code + manual entry code option)
  - Step 3: Verify code (6-digit input + verify button)
  - Step 4: Save backup codes (code list + download/print buttons)
Footer / Sticky CTA: Next/Verify/Finish button depending on step
Floating elements: Success modal after verification, help tooltip icons

# 5. Interaction Model
Tap actions: Click Next through steps, scan QR with phone camera, type verification code, copy manual code, download/print backup codes, click Finish
Swipe actions: None (but could support swipe between steps on mobile)
Scan behavior: QR code scanning via mobile authenticator app (external to system)
Auto-navigation rules: Auto-advance from Step 2 to Step 3 after QR scan timeout (45 seconds), auto-advance to Step 4 after successful verification

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Spinner while generating QR code, spinner on verify button during code check |
| Empty | Clean initial step with clear instructions |
| Error | Red error message below verification code input, shake animation on failed verification |
| Success | Green checkmark animation after verification, confetti or celebration micro-interaction |

# 7. Error Handling (Important for ops apps)
Error type: Invalid verification code
User feedback: Red text below input "Invalid code. Please try again." + shake animation
Recovery action: Clear input field, allow 2 more attempts before suggesting manual code entry or help

Error type: QR code generation failed
User feedback: Red banner "Unable to generate QR code" with manual entry code prominently displayed
Recovery action: Show manual entry code, offer refresh button

Error type: Verification code expired
User feedback: Orange warning "Code may have expired. Try the next code from your app."
Recovery action: Input field remains active for new code

Error type: Too many failed attempts
User feedback: Red banner "Too many failed attempts. Please try again in 5 minutes."
Recovery action: Disable verify button temporarily, show countdown

Error type: Network error during verification
User feedback: Red banner "Unable to verify code. Please check your connection."
Recovery action: Retry button, keep entered code

# 8. Visual Priority & Cues
- Red: verification errors, critical warnings
- Yellow: informational tips, optional features
- Green: successful verification, enabled state
- Blue: primary CTAs (Next, Verify, Finish), QR code border, actionable links
- Badge usage: "Recommended" badge on authenticator apps, "Required" badge if MFA is mandatory
- Icon expectations: shield for security, QR code icon, checkmark for completed steps, lock for secured account, download/print icons for backup codes

# 9. Performance & UX Constraints
One-handed usage: No (multi-device interaction required)
Max steps to complete task: 4 (install app → scan → verify → save codes)
Offline support: No (requires server communication for QR generation and verification)
Latency tolerance: < 1s for QR code generation, < 500ms for code verification

# 10. Device / Hardware Context
Scanner type: External (user's mobile phone camera for QR)
Gloves usage: No
Sound feedback: Optional success sound after verification
Vibration: No (web-based)

# 11. Navigation Rules
Entry point: First login prompt, AUTH-007 (Account Settings) MFA section, Admin-enforced enrollment
Exit path: AUTH-007 (Account Settings) or dashboard after completion, back to previous page if skipped
Back behavior: Warn about incomplete setup, allow back but show progress lost message
Deep links (if any): Direct link to MFA enrollment from admin invitation or policy enforcement

# 12. Edge Cases
- User already has MFA enabled on another device (show re-enrollment warning)
- User closes window during setup (session saved, can resume from last step)
- QR code becomes invalid after 15 minutes (show refresh button)
- User doesn't have smartphone (offer alternative MFA method like SMS if available, or manual code entry)
- Backup codes lost (can regenerate from AUTH-007 but invalidates old codes)
- User screenshots QR code (show security warning about storing securely)
- Verification code works but saving backup codes fails (still enable MFA, allow code regeneration later)
- Admin requires MFA but user tries to skip (disable skip option, show policy enforcement message)
- User enters spaces or hyphens in code (auto-strip and validate)

# 13. Notes for Designer (Optional but powerful)
- Clear, jargon-free instructions for non-technical users
- Large, scannable QR code (minimum 200x200px)
- Manual entry code should be easy to read (grouped, monospace font)
- Provide links to recommended authenticator apps (Google Authenticator, Authy, Microsoft Authenticator)
- Make backup codes prominently visible and easy to download/print
- Use progressive disclosure to avoid overwhelming users
- Add micro-interactions to celebrate successful setup
- Consider showing "Why MFA?" educational content at start
- Backup codes should be in a printable/downloadable format (PDF preferred)
- Clear warning about storing backup codes securely (not in email, not in screenshots)
