# 1. Screen Overview
Screen ID: AUTH-007
Name: Account Profile and Settings
Primary Persona: All authenticated users managing their account preferences

Goal of Screen (1 line): Allow users to view and update their profile information, security settings, and account preferences.

What should the user accomplish here?
- Update personal information, change password, manage MFA settings, view device trust list, configure notification preferences, and customize application settings.

# 2. Primary Action (Critical)
Main CTA: Save Changes (appears when any setting is modified)
Success condition: Valid changes submitted and saved successfully.
What happens after success:
- Changes are persisted, user sees success confirmation toast, sensitive changes (password, MFA) may require re-authentication or send confirmation email.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Profile section: Name, email, profile photo, role/title
- Security section: Change password button, MFA status toggle, Trusted devices list
- Save Changes button (sticky, appears when dirty)
🟡 Secondary (visible but less prominent)
- Preferences section: Language, timezone, notification settings, theme (light/dark)
- Account info: Account created date, last login, last password change
- Session history: Active sessions list with device/location info
⚪ Tertiary (hidden / expandable)
- API access: Personal access tokens (if applicable)
- Data & privacy: Download data, delete account options
- Billing/subscription info (if applicable)
- Audit log link (view account activity)

# 4. Layout Structure (Wireframe in words)
Header: Page title "Account Settings", breadcrumb navigation, user avatar
Body: Tabbed or sectioned layout (Profile | Security | Preferences | Sessions) with form fields and controls
Footer / Sticky CTA: Save Changes button (appears when form is dirty), Cancel button
Floating elements: Change password modal, MFA setup modal, confirmation dialogs for destructive actions, success/error toasts

# 5. Interaction Model
Tap actions: Edit profile fields, click Change Password, toggle MFA on/off, revoke device trust, change preferences, save changes, navigate between tabs
Swipe actions: Optional swipe between tabs on mobile
Scan behavior: QR code scanning if setting up MFA
Auto-navigation rules: Stay on current tab after save, scroll to top after successful save, show confirmation for sensitive changes

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Skeleton loaders for each section while data loads |
| Empty | Default values shown, no prior customization |
| Error | Inline validation errors on fields, banner for save failures |
| Success | Green toast notification, updated values displayed, Save button hidden |
| Dirty | Save Changes button visible and enabled, unsaved changes indicator |

# 7. Error Handling (Important for ops apps)
Error type: Invalid field values
User feedback: Red inline error below specific field (e.g., "Invalid email format")
Recovery action: Correct field value, validation clears in real-time

Error type: Current password incorrect (when changing password)
User feedback: Red error below password field "Current password is incorrect"
Recovery action: Re-enter correct current password, show forgot password link

Error type: Network failure during save
User feedback: Red banner "Unable to save changes. Please check your connection."
Recovery action: Retry button, unsaved changes preserved in form

Error type: Session expired during editing
User feedback: Session timeout modal (AUTH-006) appears
Recovery action: Re-authenticate, return to settings with changes preserved if possible

Error type: Concurrent modification conflict
User feedback: Orange warning "Settings were updated by another session. Please refresh and try again."
Recovery action: Refresh button to reload latest values

Error type: MFA enrollment fails
User feedback: Red error in MFA section "Unable to enable MFA. Please try again."
Recovery action: Retry button, link to support if persistent

# 8. Visual Priority & Cues
- Red: errors, destructive actions (delete account, revoke all sessions)
- Yellow: warnings, unsaved changes indicator
- Green: successful saves, MFA enabled status, verified email
- Blue: primary CTAs (Save Changes, Change Password), editable fields, toggle switches
- Badge usage: "Verified" badge on email, "Enabled" on MFA, "Current Device" on session list, "Admin" or role badge
- Icon expectations: user avatar, lock for security, shield for MFA, bell for notifications, globe for language, clock for timezone, device icons (desktop/mobile/tablet)

# 9. Performance & UX Constraints
One-handed usage: No (desktop/tablet focused, form-heavy)
Max steps to complete task: 2-4 depending on change (edit field → save, or edit → verify → confirm → save)
Offline support: Limited - can view cached settings but cannot save changes without connection
Latency tolerance: < 500ms for field updates, < 2s for save operations

# 10. Device / Hardware Context
Scanner type: Camera for profile photo upload, QR scanner for MFA setup (if initiated from this screen)
Gloves usage: No
Sound feedback: No
Vibration: No

# 11. Navigation Rules
Entry point: User menu dropdown (top-right avatar), main navigation "Settings" link, first-login profile completion prompt
Exit path: Returns to previous page or dashboard, breadcrumb navigation available
Back behavior: If unsaved changes exist, show "Unsaved changes will be lost" confirmation dialog
Deep links (if any): Direct links to specific tabs (e.g., /account/settings#security, /account/settings#mfa)

# 12. Edge Cases
- User changes email and it's already in use by another account (show error, suggest account merge or contact admin)
- User tries to disable MFA but org policy requires it (show policy message, disable toggle)
- User changes timezone, affects scheduled reports/notifications (show warning about impact)
- User revokes all trusted devices including current one (require re-auth after save)
- Profile photo upload exceeds size limit or wrong format (show clear error with requirements)
- User's role/permissions changed by admin while editing settings (some sections may become read-only or hidden)
- User tries to delete account with active subscriptions or owned resources (show blocking warning)
- Password change requires current password but user doesn't remember (provide forgot password flow)
- MFA already enabled, user tries to re-enable (show current status, offer "Reset MFA" option)
- User modifies multiple sections, some save successfully while others fail (partial success handling)
- Session expires during profile photo upload (large file, long upload time)
- User switches language, UI immediately updates (dynamic translation)

# 13. Notes for Designer (Optional but powerful)
- Clear visual distinction between view mode and edit mode for fields
- Use progressive disclosure for advanced settings (collapsible sections)
- Group related settings logically (Security together, Preferences together)
- Show impact of changes before saving (e.g., "This will log you out of all other sessions")
- Make destructive actions (delete account, disable MFA) require confirmation with typed confirmation
- Provide inline help text and tooltips for complex settings
- Profile photo upload should support drag-and-drop, camera capture, and file picker
- Password strength indicator when changing password
- Show last updated timestamp for each setting if relevant
- MFA section should clearly show status (Enabled/Disabled) and provide clear CTAs
- Trusted devices list should show device type, browser, location (approximate), last active
- Offer "Sign out all other sessions" bulk action for security
- Consider showing security score/health indicator based on settings (strong password, MFA enabled, etc.)
- Make Save Changes button sticky so it's always accessible during long forms
- Use autosave for non-sensitive preferences (theme, language) with subtle feedback
- Provide "Reset to defaults" option for preferences section
