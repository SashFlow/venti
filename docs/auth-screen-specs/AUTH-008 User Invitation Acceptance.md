# 1. Screen Overview
Screen ID: AUTH-008
Name: User Invitation Acceptance
Primary Persona: New users who received an invitation link to join the platform

Goal of Screen (1 line): Guide new users through accepting their invitation, setting up their account, and completing first-time profile setup.

What should the user accomplish here?
- Validate invitation token, set a strong password, accept terms of service, complete profile information, and gain access to the platform.

# 2. Primary Action (Critical)
Main CTA: Complete Setup (final step) / Next (intermediate steps)
Success condition: Valid invitation token + password set + terms accepted + required profile fields completed + account activated.
What happens after success:
- User account is fully activated, invitation token is consumed, user is signed in automatically and redirected to onboarding tour or role-appropriate dashboard.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Step indicator (e.g., Step 1 of 4), Current step form fields (password, name, profile info), Primary CTA (Next / Complete Setup)
🟡 Secondary (visible but less prominent)
- Invitation context (invited by [name], invited to [workspace/organization]), Terms of Service and Privacy Policy links with acceptance checkbox, Password strength indicator
⚪ Tertiary (hidden / expandable)
- Invitation expiration info, Role/permissions preview, Help/support links, Skip optional fields option

# 4. Layout Structure (Wireframe in words)
Header: Company logo, progress indicator (Step X of Y), invitation badge
Body: Centered card (max-width 480px) with step-based form:
  - Step 1: Welcome message, token validation, invitation details
  - Step 2: Set password (with requirements and strength meter)
  - Step 3: Accept terms of service and privacy policy
  - Step 4: Complete profile (name, phone, optional avatar, preferences)
Footer / Sticky CTA: Next/Complete Setup button, Back button (except on first step)
Floating elements: Success modal after completion, error toast for validation failures

# 5. Interaction Model
Tap actions: Click Next to progress through steps, type password and profile info, check terms acceptance, upload profile photo (optional), click Complete Setup
Swipe actions: Optional swipe between steps on mobile
Scan behavior: Not applicable
Auto-navigation rules: Auto-advance after token validation (Step 1), auto-redirect to dashboard after completion

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Spinner during token validation, skeleton for invitation details |
| Empty | Clean form ready for input on each step |
| Error | Red banner for invalid/expired token, inline errors for field validation |
| Success | Green checkmark after each step completion, celebration animation after final step |

# 7. Error Handling (Important for ops apps)
Error type: Invalid or expired invitation token
User feedback: Red banner "This invitation link is invalid or has expired. Please contact your administrator for a new invitation."
Recovery action: Show support contact info, disable form, no retry possible without new invitation

Error type: Invitation already accepted
User feedback: Blue info banner "This invitation has already been used. Would you like to sign in instead?"
Recovery action: Button to redirect to AUTH-001 (Sign In)

Error type: Weak password
User feedback: Red text below password field "Password does not meet requirements" + strength meter shows weak/fair
Recovery action: Update password, requirements checklist shows which criteria are not met

Error type: Terms not accepted
User feedback: Red text below checkbox "You must accept the Terms of Service to continue"
Recovery action: Check the terms checkbox

Error type: Email already registered
User feedback: Orange warning "This email is already registered. Would you like to sign in or reset your password?"
Recovery action: Redirect to AUTH-001 or AUTH-002

Error type: Network failure during account creation
User feedback: Red banner "Unable to complete setup. Please check your connection and try again."
Recovery action: Retry button, all entered information preserved

Error type: Org/workspace deleted before invitation accepted
User feedback: Red banner "This organization is no longer active. Please contact support."
Recovery action: Show support contact, disable form

# 8. Visual Priority & Cues
- Red: errors, invalid token, expired invitation
- Yellow: warnings, optional fields
- Green: valid token, step completion, strong password, successful setup
- Blue: primary CTAs (Next, Complete Setup), progress indicators, informational messages
- Badge usage: "Invited by [Name]" badge, role badge preview, "Optional" badge on non-required fields
- Icon expectations: envelope for invitation, checkmark for completed steps, lock for password security, shield for terms/privacy, user icon for profile, warning for errors

# 9. Performance & UX Constraints
One-handed usage: No (multi-step form, desktop/tablet focused)
Max steps to complete task: 4 steps (validate → password → terms → profile)
Offline support: No (requires server communication for validation and account creation)
Latency tolerance: < 2s for token validation, < 500ms per field validation, < 3s for final account creation

# 10. Device / Hardware Context
Scanner type: Camera for optional profile photo upload
Gloves usage: No
Sound feedback: Optional success sound after completion
Vibration: Optional on mobile devices

# 11. Navigation Rules
Entry point: Email invitation link with token parameter (e.g., /auth/accept-invitation?token=xxx)
Exit path: Onboarding tour (if first-time user flow exists) or role-appropriate dashboard (WEB-001, ADM-001, etc.)
Back behavior: Navigate to previous step, preserve entered data, warn before leaving flow entirely
Deep links (if any): Invitation URL with unique token parameter

# 12. Edge Cases
- Token validation fails silently (server issue) - show generic error, log for admin review
- User closes browser mid-flow (save partial progress if possible, allow resumption with same token)
- User invited to multiple organizations (show selector after completion)
- Admin revokes invitation while user is completing setup (detect on final submission, show clear message)
- User enters different email than invitation email (block or warn, depending on policy)
- Invitation for SSO-only organization (skip password step, redirect to SSO flow)
- User already has account but invitation is for different workspace (merge or create separate account based on policy)
- MFA required by org policy (auto-redirect to AUTH-004 after initial setup)
- Profile photo upload fails but other fields save (show warning, allow retry later)
- Terms/privacy policy updated since invitation sent (show latest version, user must accept new terms)
- User invited with specific role but role no longer exists (assign default role, notify admin)
- Token used but account creation fails due to DB error (invalidate token to prevent reuse, generate new invitation)

# 13. Notes for Designer (Optional but powerful)
- Warm, welcoming tone for new users (this is their first impression)
- Clear progress indicator so users know how many steps remain
- Chunked information architecture to avoid overwhelming users
- Password requirements prominently displayed with real-time validation
- Terms of Service should be scannable (headings, bullet points) or provide summary
- Allow users to skip optional profile fields but encourage completion
- Profile photo upload should be truly optional with nice default avatars
- Show invitation context prominently (who invited you, to which workspace)
- Celebrate completion with micro-interaction or animation
- Consider showing a preview of what they'll access after setup (dashboard screenshot, feature highlights)
- Support password manager integration for password setup
- Make it easy to go back and change information before final submission
- Clear distinction between required and optional fields
- Consider showing "role preview" to set expectations about permissions
- Auto-save progress between steps if user navigates away
- Provide clear help/support access in case users have questions
- If MFA is required, mention this early in the flow so users can prepare
