# AUTH-007: Account Profile and Settings - Component Specification

## 1. Screen Reference
- **Screen ID**: AUTH-007
- **Screen Name**: Account Profile and Settings
- **Related Base Spec**: `../auth-screen-specs/AUTH-007 Account Profile and Settings.md`
- **Route**: `/account/settings`

---

## 2. Component Inventory

### Primary Components (Core Settings)
1. **Tab Navigation** (Tabs) - Profile | Security | Preferences | Sessions
2. **Profile Photo Upload** (Image Upload) - Avatar with edit overlay
3. **Form Fields** (Input Group) - Name, email, phone, title
4. **Save Changes Button** (Button/Primary) - Sticky, appears when dirty
5. **MFA Toggle** (Switch) - Enable/disable MFA
6. **Change Password Button** (Button) - Opens password change modal

### Secondary Components (Security & Preferences)
7. **Trusted Devices List** (Table/Cards) - Active sessions with revoke actions
8. **Language Selector** (Dropdown) - UI language
9. **Timezone Selector** (Dropdown/Autocomplete) - User timezone
10. **Theme Toggle** (Radio/Segment) - Light / Dark / System
11. **Notification Preferences** (Checkbox Group) - Email/push notification settings

### Tertiary Components (Account Info & Data)
12. **Account Created Date** (Text) - Read-only info
13. **Last Login** (Text) - Last successful login timestamp
14. **Last Password Change** (Text) - Password age
15. **Download Data Button** (Button) - GDPR data export
16. **Delete Account Button** (Button/Destructive) - Account deletion flow

### Modal/Overlay Components
17. **Change Password Modal** - Password update form
18. **MFA Setup Modal** - Links to AUTH-004 or inline setup
19. **Device Revoke Confirmation** - Confirm revoke device trust
20. **Delete Account Confirmation** - Multi-step account deletion

---

## 3. Data Schema

| Field Name | Type | Required | Validation | Default Value | Display Format |
|------------|------|----------|------------|---------------|----------------|
| `firstName` | string | Yes | Max 50 chars | null | Capitalized |
| `lastName` | string | Yes | Max 50 chars | null | Capitalized |
| `email` | string | Yes | Email format, unique | null | lowercase |
| `phone` | string | No | Phone format | null | Formatted (US: (123) 456-7890) |
| `title` | string | No | Max 100 chars | null | As entered |
| `profilePhotoUrl` | string | No | Valid image URL | null | Image src |
| `language` | string | No | ISO 639-1 code | 'en' | Language name |
| `timezone` | string | No | IANA timezone | Auto-detected | Timezone label |
| `theme` | enum | No | 'light', 'dark', 'system' | 'system' | Radio selection |
| `mfaEnabled` | boolean | No | N/A | false | Toggle state |
| `notificationPreferences` | object | No | Email, push, SMS flags | {} | Checkbox group |

---

## 4. Layout Specification

**Pattern**: Full-page layout with tabs
**Container Max Width**: 900px, centered

**Layout**:
```
[Header]
  Account Settings
  [User avatar + name]
  [Breadcrumb]

[Tab Navigation]
  Profile | Security | Preferences | Sessions

[Tab Content Area]
  (varies by tab)

[Sticky Footer]
  [Save Changes] (appears when dirty)
```

**Tab-Specific Layouts**:

**Profile Tab**:
```
[Profile Photo Circle]
  [Edit overlay on hover]

First Name      Last Name
[Input]         [Input]

Email           Phone (optional)
[Input]         [Input]

Title (optional)
[Input]

--- Account Info ---
Created: [date]
Last Login: [timestamp]
```

**Security Tab**:
```
--- Authentication ---
[Change Password] button
Last password change: [date]

--- Multi-Factor Authentication ---
MFA Status: [Enabled/Disabled toggle]
[Setup MFA] or [Manage MFA] button

--- Trusted Devices ---
[Device list table/cards]
Device | Browser | Location | Last Active | [Revoke]

[Sign out all other sessions] button
```

**Preferences Tab**:
```
--- Appearance ---
Theme: ( ) Light  ( ) Dark  ( ) System

--- Localization ---
Language: [Dropdown]
Timezone: [Dropdown with search]

--- Notifications ---
☑ Email notifications
☑ Push notifications
☐ SMS notifications (if enabled)

Specific preferences:
☑ Order updates
☑ Exception alerts
☐ Weekly digest
```

**Sessions Tab**:
```
--- Active Sessions ---
[Current session badge]
[Session cards with device info, IP, last active]
[Revoke] button for each (except current)

[Revoke All Other Sessions] button
```

---

## 5. Component Details

### Tab Navigation
- **Type**: Horizontal tabs
- **Count**: 4 tabs
- **States**: Active (underlined), inactive, hover
- **Behavior**: Click switches content panel, updates URL hash
- **Accessibility**: `role="tablist"`, arrow key navigation
- **Responsive**: Scrollable on mobile if overflow

### Profile Photo Upload
- **Type**: Image with edit overlay
- **Size**: 96px circle (desktop), 80px (mobile)
- **Upload Methods**:
  - Click to open file picker
  - Drag and drop
  - Camera capture (mobile)
- **Accepted Formats**: JPG, PNG, WEBP
- **Max Size**: 5MB
- **Validation**: Aspect ratio crop tool, image preview before save
- **Default**: Initials avatar if no photo
- **Edit Overlay**: Appears on hover, shows camera icon + "Change Photo"

### Form Fields (Profile)
- **Type**: Text inputs
- **Size**: Full width in 2-column grid (desktop), stacked (mobile)
- **States**: Default, focus, error, disabled, dirty (unsaved changes indicator)
- **Validation**: Real-time on blur
- **Email Change**: Requires re-verification (sends confirmation email)

### Save Changes Button
- **Type**: Button
- **Variant**: Primary
- **Behavior**: Sticky to bottom of viewport, only appears when form has unsaved changes
- **Size**: Auto width (min 120px), 48px height
- **Placement**: Bottom-right corner, floats above content
- **Disabled**: When no changes or validation errors
- **Success**: Brief toast "Changes saved", button disappears

### MFA Toggle
- **Type**: Switch (Toggle)
- **Size**: Large switch, 52x28px
- **States**: On (green), off (gray), disabled, loading
- **Labels**: "Enabled" (green) / "Disabled" (gray) next to switch
- **Behavior**:
  - **Turn ON**: Opens MFA Setup Modal or navigates to AUTH-004
  - **Turn OFF**: Requires password confirmation, shows warning about security implications
- **Policy Enforcement**: If org requires MFA, toggle is disabled in "on" position

### Change Password Button
- **Type**: Button
- **Variant**: Secondary (outlined)
- **Size**: Auto width, 44px height
- **Content**: "Change Password"
- **Action**: Opens Change Password Modal

### Trusted Devices List
- **Type**: Table (desktop) or Cards (mobile)
- **Columns/Fields**:
  - Device icon (desktop/mobile/tablet)
  - Browser + OS (e.g., "Chrome on macOS")
  - Location (city, approximate from IP)
  - Last active (relative time)
  - Revoke button (red text)
- **Current Device**: Badge "Current Session", revoke disabled
- **Empty State**: "No other trusted devices"

---

## 6. Modal/Drawer/Popover Specifications

### Change Password Modal
- **Trigger**: Click "Change Password" button
- **Size**: 480px width, auto height
- **Header**: "Change Password"
- **Body**:
  - Current Password input (required)
  - New Password input (with strength meter)
  - Confirm New Password input
  - Requirements checklist (same as AUTH-003)
- **Footer**: "Cancel" | "Change Password" (primary)
- **Validation**: Same rules as AUTH-003
- **Success**: Modal closes, toast "Password updated", sends confirmation email
- **Re-auth**: If session is old, may require full re-login

### MFA Setup Modal
- **Trigger**: Toggle MFA on when currently disabled
- **Size**: 540px width
- **Content**: Embedded version of AUTH-004 enrollment flow OR redirect to AUTH-004
- **Steps**: Install app → Scan QR → Verify → Backup codes
- **Completion**: Closes modal, toggle remains on, success message

### MFA Disable Confirmation
- **Trigger**: User toggles MFA off
- **Size**: 420px width
- **Header**: "Disable Multi-Factor Authentication?"
- **Body**: 
  - Warning: "Disabling MFA reduces your account security. Are you sure?"
  - Password input (required to confirm)
- **Footer**: "Cancel" | "Disable MFA" (destructive/red)
- **Success**: MFA disabled, backup codes invalidated, confirmation message

### Revoke Device Confirmation
- **Trigger**: Click "Revoke" on trusted device
- **Size**: 400px width
- **Header**: "Revoke Device Trust?"
- **Body**: "This will require MFA verification next time you sign in from [device name]."
- **Footer**: "Cancel" | "Revoke" (destructive)
- **Success**: Device removed from list, toast confirmation

### Delete Account Confirmation (Multi-Step)
- **Trigger**: Click "Delete Account" button
- **Size**: 480px width
- **Step 1**: Warning about data loss, consequences
  - Checkbox: "I understand this action cannot be undone"
  - "Cancel" | "Continue"
- **Step 2**: Password confirmation
  - Password input: "Enter your password to confirm"
  - "Cancel" | "Delete My Account" (destructive/red)
- **Step 3**: Final confirmation with typed confirmation
  - "Type DELETE to confirm"
  - Text input
  - "Cancel" | "Delete Account" (only enabled when "DELETE" typed)
- **Success**: Account deleted, signed out, navigate to goodbye page

---

## 7. Interaction Flows

### Flow 1: Update Profile Information
1. User edits name/email/phone → Form marked as dirty
2. Save Changes button appears (sticky)
3. User clicks Save Changes → Loading state
4. Server validates and saves → Success toast
5. Save button disappears, form marked clean
6. If email changed → Verification email sent, user notified

### Flow 2: Enable MFA
1. User toggles MFA switch on → MFA Setup Modal opens
2. User completes enrollment (QR scan, verify, backup codes)
3. Modal closes → Toggle remains on, success message
4. Trusted devices list now shows "MFA required" badge

### Flow 3: Change Password
1. User clicks "Change Password" → Modal opens
2. User enters current password → Validates
3. User enters new password → Strength meter updates, requirements check
4. User confirms password → Passwords match validation
5. User clicks "Change Password" → Loading
6. Server saves → Modal closes, success toast, confirmation email sent

### Flow 4: Revoke Device Trust
1. User clicks "Revoke" on device → Confirmation modal
2. User confirms → Device removed from list
3. Next login from that device requires full MFA

---

## 8. State Management

### Local State (per tab)
- **Profile**: `{ firstName, lastName, email, phone, title, profilePhoto, isDirty }`
- **Security**: `{ mfaEnabled, trustedDevices[], isChangingPassword }`
- **Preferences**: `{ language, timezone, theme, notifications, isDirty }`
- **Sessions**: `{ activeSessions[], currentSessionId }`

### Shared State
- `currentUser`: User object (updated after profile changes)
- `hasUnsavedChanges`: boolean (blocks navigation if true)

### Data Fetching
- **GET `/api/user/profile`**: Load profile data
- **PATCH `/api/user/profile`**: Update profile fields
- **POST `/api/user/profile/photo`**: Upload profile photo
- **POST `/api/user/password/change`**: Change password
- **POST `/api/user/mfa/toggle`**: Enable/disable MFA
- **GET `/api/user/sessions`**: List trusted devices
- **DELETE `/api/user/sessions/:sessionId`**: Revoke device
- **DELETE `/api/user/account`**: Delete account

---

## 9. Accessibility Notes

- Tabs: Full keyboard navigation (arrow keys, Home, End)
- Forms: All fields have labels, proper fieldset grouping
- MFA toggle: Announced as "Multi-factor authentication, currently [on/off]"
- Save button: Sticky positioning doesn't interfere with keyboard users
- Modals: Focus trap, Escape to close (except destructive actions)
- Destructive actions: Clear warnings, require confirmation

---

## 10. Responsive Behavior

- **Desktop (>1024px)**: 2-column grid for form fields, table for devices
- **Tablet (768-1023px)**: 2-column grid collapses to 1 column for some fields, devices remain in table
- **Mobile (<768px)**: All fields single column, devices as cards, tabs scrollable

---

## 11. Design Tokens Reference

- Profile photo border: `--gray-200`, hover overlay `rgba(0,0,0,0.6)`
- Tab active underline: `--blue-600`, 3px height
- Dirty indicator: Dot `--blue-500` next to field label
- MFA toggle on: `--green-600`, off: `--gray-400`
- Revoke button: `--red-600` text
- Save button: Sticky with shadow `--shadow-lg`
- Destructive actions: `--red-600` background, `--red-700` hover
