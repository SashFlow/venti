# AUTH-006: Session Timeout and Re-authentication - Component Specification

## 1. Screen Reference
- **Screen ID**: AUTH-006
- **Screen Name**: Session Timeout and Re-authentication  
- **Related Base Spec**: `../auth-screen-specs/AUTH-006 Session Timeout and Re-authentication.md`
- **Route**: Modal overlay, no dedicated route

---

## 2. Component Inventory

### Primary Components
1. **Countdown Timer** (Text/Animated) - Time until expiration
2. **Extend Session Button** (Button/Primary) - Refresh session (warning phase)
3. **Password Input** (PasswordInput) - Re-authentication (expired phase)
4. **Sign In Button** (Button/Primary) - Submit re-auth (expired phase)

### Secondary Components
5. **Modal Backdrop** (Overlay) - Blocks interaction with page
6. **Warning Icon** (Icon) - Clock or warning triangle
7. **Sign Out Button** (Button/Secondary) - Explicit sign out option
8. **User Email Display** (Text) - Context about which account
9. **Unsaved Changes Warning** (Alert) - If work detected

### Tertiary Components
10. **Auto-save Status** (Text) - If applicable
11. **Last Activity Timestamp** (Text) - When user was last active

---

## 3. Data Schema

| Field Name | Type | Required | Validation | Default Value | Display Format |
|------------|------|----------|------------|---------------|----------------|
| `remainingTime` | number (seconds) | Yes | > 0 | 120 (2 min) | MM:SS |
| `password` | string | Yes (if expired) | Min 1 char | null | masked |
| `hasUnsavedWork` | boolean | No | N/A | false | Alert display |

---

## 4. Layout Specification

**Pattern**: Modal overlay (blocking)
**Modal Size**: 400px width, auto height, centered
**Backdrop**: Semi-transparent dark overlay (40% opacity), blur effect

**Warning Phase Layout**:
```
[Modal]
  [Clock Icon]
  
  Session Expiring Soon
  
  Your session will expire in
  [2:45]
  (Countdown Timer - Large)
  
  You've been inactive. Extend your
  session to continue working.
  
  [Extend Session] [Sign Out]
```

**Expired Phase Layout**:
```
[Modal]
  [Lock Icon]
  
  Session Expired
  
  For security, you've been signed out.
  Please sign in again to continue.
  
  Signed in as: u***@company.com
  
  Password:
  [Password Input]
  
  [Sign In Again] [Cancel]
  
  [Forgot password?]
```

---

## 5. Component Details

### Countdown Timer
- **Type**: Text (dynamic, animated)
- **Size**: 48-64px font size, bold
- **Format**: `M:SS` (e.g., "2:45", "0:30", "0:05")
- **Color Progression**:
  - > 60s: `--gray-700` (neutral)
  - 30-60s: `--yellow-600` (warning)
  - < 30s: `--red-600` (urgent) + pulsing animation
- **Updates**: Every second
- **Behavior**: When reaches 0:00 → Modal switches to expired phase

### Extend Session Button (Warning Phase)
- **Type**: Button
- **Variant**: Primary
- **Size**: Auto width (content + 32px padding), 48px height
- **States**: Default, hover, loading, disabled
- **Content**: "Extend Session" or "Extending..." (loading)
- **Action**: Sends keep-alive to server, refreshes session token
- **Success**: Modal closes with fade animation, user returns to work

### Password Input (Expired Phase)
- **Type**: Password Input with visibility toggle
- **Size**: Full width, 48px height
- **States**: Default, focus, error, disabled
- **Autofill**: Supports password managers
- **Content**:
  - Label: "Password"
  - Placeholder: "Enter your password"
  - Error: "Incorrect password"
- **Focus**: Auto-focused when expired phase appears

### Sign In Button (Expired Phase)
- **Type**: Button
- **Variant**: Primary
- **Size**: Full width, 48px height
- **States**: Default, hover, loading, disabled
- **Content**: "Sign In Again" or "Signing In..." (loading)
- **Disabled When**: Password empty or request in progress
- **MFA Flow**: If MFA enabled, successful password → Navigate to AUTH-005

### Sign Out Button
- **Type**: Button
- **Variant**: Secondary (outlined or ghost)
- **Size**: Auto width, 48px height
- **Placement**: Next to Extend Session (warning) or below Sign In (expired)
- **Content**: "Sign Out"
- **Action**: Confirms intent → Clears session → Navigate to AUTH-001
- **Confirmation**: If unsaved work detected, shows warning before signing out

### Unsaved Changes Warning
- **Type**: Alert Banner
- **Variant**: Warning (yellow/orange)
- **Placement**: Top of modal, before main content
- **Content**:
  - Icon: Warning triangle
  - Text: "You have unsaved changes. Save your work before signing out."
  - Action: "Save Draft" button (if available)
- **Display Condition**: Only if `hasUnsavedWork === true`

---

## 6. Modal/Drawer/Popover Specifications

### Confirm Sign Out Modal (Nested)
- **Trigger**: User clicks Sign Out when unsaved work exists
- **Size**: 360px width
- **Header**: "Unsaved Changes"
- **Body**: "You have unsaved work. Are you sure you want to sign out? Your changes may be lost."
- **Footer**:
  - "Cancel" (return to session timeout modal)
  - "Sign Out Anyway" (destructive, red button)
- **Dismissal**: Cancel button or escape key

---

## 7. Interaction Flows

### Flow 1: Session Extended (Warning Phase)
1. User idle for [threshold] → Modal appears with 2-minute countdown
2. Countdown ticks every second → Color changes from gray → yellow → red
3. User clicks "Extend Session" → Loading spinner appears
4. Server refreshes session → Success
5. Modal closes with fade → User returns to exact same context
6. Session extended by [duration] (e.g., +30 minutes)

### Flow 2: Session Expires While Idle
1. Countdown reaches 0:00 → Modal switches to "Expired" phase
2. Password input appears, focused
3. User enters password → Clicks "Sign In Again"
4. Server validates password:
   - Valid → Session restored, modal closes
   - Valid + MFA enabled → Navigate to AUTH-005
   - Invalid → Error message, password cleared, try again
5. After successful re-auth → User returns to same page with state preserved

### Flow 3: User Signs Out Voluntarily
1. User clicks "Sign Out" button in modal
2. If unsaved work → Confirm Sign Out Modal appears
   - User confirms → Sign out proceeds
   - User cancels → Return to session modal
3. If no unsaved work → Immediate sign out
4. Session cleared → Navigate to AUTH-001

### Flow 4: Network Failure During Extension
1. User clicks "Extend Session" → Request fails (network error)
2. Error message appears: "Unable to extend session. Please check your connection."
3. Retry button appears → User can try again
4. Countdown continues during retry attempts
5. If countdown reaches 0 before successful extension → Switch to expired phase

---

## 8. State Management

### Local State
- `phase`: 'warning' | 'expired'
- `remainingTime`: number (seconds)
- `password`: string (for expired phase)
- `isExtending`: boolean
- `isAuthenticating`: boolean
- `error`: string | null
- `hasUnsavedWork`: boolean (detected from parent app)

### Shared State
- `sessionToken`: string - Will be refreshed or replaced
- `userEmail`: string - For display context
- `lastActivity`: timestamp - When user was last active

### Data Fetching
- **POST `/api/auth/session/extend`**
  - Response: `{ newToken, expiresAt }` or `{ error }`
  - Extends session without re-authentication
- **POST `/api/auth/session/reauthenticate`**
  - Request: `{ password }`
  - Response: `{ newToken, requireMFA }` or `{ error }`
  - Full re-authentication with password

---

## 9. Accessibility Notes

- Modal has `role="alertdialog"` for urgency
- Focus trap: User cannot tab outside modal
- Countdown announced by screen reader every 30 seconds (not every second, to avoid annoyance)
- At 30s remaining: Loud announcement "Session expiring in 30 seconds"
- Expired phase: Announced immediately with `role="alert"`
- Keyboard: Escape key does NOT close (must resolve)
- All buttons accessible via keyboard

---

## 10. Responsive Behavior

- Modal width: 400px on desktop, 90vw (max 400px) on mobile
- Font sizes adjust for mobile readability
- Buttons stack vertically on very small screens (<360px)

---

## 11. Design Tokens Reference

- Countdown colors:
  - Normal: `--gray-700`
  - Warning: `--yellow-600`
  - Urgent: `--red-600` + pulse animation
- Modal backdrop: `rgba(0, 0, 0, 0.4)` + `blur(4px)`
- Modal shadow: `--shadow-2xl` (large elevation)
- Warning alert background: `--yellow-50`, border `--yellow-400`
- Buttons: Same as AUTH-001
- Pulse animation: Scale 1.0 → 1.05 → 1.0 every 2s
