# AUTH-005: MFA Verification - Component Specification

## 1. Screen Reference
- **Screen ID**: AUTH-005
- **Screen Name**: MFA Verification
- **Related Base Spec**: `../auth-screen-specs/AUTH-005 MFA Verification.md`
- **Route**: `/auth/mfa/verify`

---

## 2. Component Inventory

### Primary Components
1. **6-Digit Code Input** (OTP Input) - Verification code entry
2. **Verify Button** (Button/Primary) - Submit code for verification
3. **User Context Display** (Text) - Shows email/username for clarity

### Secondary Components
4. **Trust Device Checkbox** (Checkbox) - Remember device for 30 days
5. **Use Backup Code Link** (Link) - Switch to backup code entry
6. **Resend Code Info** (Text) - For SMS-based (if applicable)
7. **Back to Login Link** (Link) - Return to AUTH-001

### Tertiary Components
8. **Lost Access Help Link** (Link) - Account recovery information
9. **Security Badge** (Icon) - Visual indicator in header
10. **Remaining Attempts Counter** (Text) - Shows attempts left before lockout

---

## 3. Data Schema

| Field Name | Type | Required | Validation | Default Value | Display Format |
|------------|------|----------|------------|---------------|----------------|
| `verificationCode` | string | Yes | 6 digits | null | 6 separate boxes |
| `trustDevice` | boolean | No | N/A | false | checkbox |
| `userEmail` | string | Yes (context) | N/A | From session | Partially masked (u***@company.com) |

---

## 4. Layout Specification

**Pattern**: Centered card, minimal design
**Card Max Width**: 420px

**Layout**:
```
[Security Badge + Back Arrow]

Two-Factor Authentication
Verifying: u***@company.com

Enter the 6-digit code from your
authenticator app

[6-Digit Input Boxes]

□ Trust this device for 30 days

[Verify Button]

[Use backup code instead]
[Lost access to authenticator?]
```

**Spacing**: 32px card padding, 24px between major sections

---

## 5. Component Details

### 6-Digit Code Input
- **Type**: OTP Input (6 separate boxes)
- **Size**: Each box 52x60px, 10px gap
- **States**: Empty, filled, focus, error (red border + shake), success (green check)
- **Behavior**:
  - Auto-focus first box on load
  - Auto-advance on digit entry
  - Auto-submit when 6 digits complete (optional)
  - Paste support (distributes code across boxes)
  - Backspace navigates to previous box
- **Error Animation**: Shake horizontally on invalid code, clear all boxes

### User Context Display
- **Type**: Text
- **Content**: "Verifying: [email]" where email is partially masked
- **Style**: Small text (14px), gray color
- **Purpose**: Clarity on shared/public devices about which account is being verified

### Verify Button
- **Type**: Button
- **Variant**: Primary
- **Size**: Full width, 48px height
- **States**: Default, hover, loading, disabled
- **Content**: "Verify" or "Verifying..." (loading)
- **Disabled When**: Code not 6 digits or verification in progress
- **Auto-submit Option**: If enabled, button auto-triggers when 6 digits entered

### Trust Device Checkbox
- **Type**: Checkbox with label
- **Size**: 20px checkbox, full-width label
- **Placement**: Below code input, above verify button
- **Content**: "Trust this device for 30 days"
- **Info Tooltip**: Icon next to label explaining "You won't need to enter a code on this device for 30 days"
- **Default**: Unchecked
- **Warning**: Only show on recognized/secure devices (not public computers)

### Use Backup Code Link
- **Type**: Link
- **Style**: Text link, centered, 14px
- **Placement**: Below verify button
- **Content**: "Use backup code instead"
- **Action**: Switches input to backup code mode (8-char input instead of 6-digit)

### Backup Code Input (Alternate Mode)
- **Type**: Text Input (appears when "Use backup code" clicked)
- **Size**: Full width, 48px height
- **Format**: `XXXX-XXXX` (8 characters with hyphen)
- **Validation**: 8 alphanumeric characters
- **Note**: "Each backup code can only be used once"
- **Return Link**: "Use authenticator app code" to switch back

---

## 6. Modal/Drawer/Popover Specifications

### Account Locked Modal
- **Trigger**: Too many failed verification attempts (typically after 5-10 attempts)
- **Size**: 400px width
- **Header**: "Account Temporarily Locked"
- **Body**: 
  - "Your account has been locked for 15 minutes due to multiple failed verification attempts."
  - "For security, please wait before trying again or use a backup code."
  - Countdown timer showing time remaining
- **Footer**: 
  - "Use Backup Code" button
  - "Contact Support" button
- **Dismissal**: Cannot dismiss, must use backup code or wait

### Lost Access Modal
- **Trigger**: User clicks "Lost access to authenticator?" link
- **Size**: 460px width
- **Header**: "Can't Access Authenticator?"
- **Body**: 
  - "You can use a backup code to sign in."
  - "If you don't have your backup codes, please contact your administrator for account recovery."
  - Support contact information
- **Footer**:
  - "Use Backup Code" button
  - "Contact Support" button (opens email or support form)
  - "Cancel" button

---

## 7. Interaction Flows

### Flow 1: Successful Verification
1. User lands on MFA verification screen after password authentication
2. User opens authenticator app on phone → Reads 6-digit code
3. User enters code in boxes → Auto-advances through boxes
4. When 6 digits entered → Auto-submit or user clicks Verify
5. Button shows loading state → Server validates code
6. Code valid → Brief success animation → Navigate to workspace selector or dashboard
7. If "Trust device" checked → Cookie/token saved for 30-day bypass

### Flow 2: Failed Verification
1. User enters incorrect code
2. Boxes shake, turn red briefly
3. Error message appears: "Invalid code. X attempts remaining."
4. Boxes clear, focus returns to first box
5. User tries again with correct code or uses backup code

### Flow 3: Using Backup Code
1. User clicks "Use backup code instead"
2. Input switches from 6-digit boxes to single 8-char input
3. User enters backup code (with or without hyphen, system normalizes)
4. Click Verify → Server validates and consumes backup code
5. Success → Navigate to dashboard + reminder to regenerate backup codes

### Flow 4: Account Lockout
1. After 5-10 failed attempts → Account Locked Modal appears
2. Countdown timer shows remaining time (15 minutes)
3. User can either:
   - Wait for timer to complete → Modal closes, attempts reset
   - Use backup code → Bypasses lockout
   - Contact support → Opens support channel

---

## 8. State Management

### Local State
- `code`: string (6 chars)
- `trustDevice`: boolean
- `isVerifying`: boolean
- `error`: string | null
- `remainingAttempts`: number | null
- `isBackupCodeMode`: boolean
- `backupCode`: string (8 chars)

### Shared State
- `partialAuthToken`: string - From password auth, not yet fully authenticated
- `userEmail`: string - For context display

### Data Fetching
- **POST `/api/auth/mfa/verify`**
  - Request: `{ partialAuthToken, code, trustDevice }`
  - Response: `{ authToken, user }` or `{ error, remainingAttempts }`
  - Error codes: INVALID_CODE, EXPIRED_CODE, ACCOUNT_LOCKED
- **POST `/api/auth/mfa/verify-backup`**
  - Request: `{ partialAuthToken, backupCode }`
  - Response: `{ authToken, user, backupCodesRemaining }` or `{ error }`

---

## 9. Accessibility Notes

- Focus management: First digit box auto-focused on load
- Code input: Each box announced as "Digit X of 6"
- Error messages: `role="alert"` for immediate announcement
- Trust device checkbox: Clear label association
- Locked state: Screen reader announces lockout status and countdown
- Keyboard navigation: Tab, Shift+Tab between all interactive elements

---

## 10. Responsive Behavior

- **Desktop**: Large code boxes (52x60px), comfortable spacing
- **Tablet**: Slightly smaller boxes (48x56px), maintained spacing
- **Mobile**: Optimized for thumb typing, boxes 44x52px minimum
- Card adapts to viewport, maintains readability

---

## 11. Design Tokens Reference

- Code box focus: `--blue-500` border
- Code box error: `--red-500` border + shake animation
- Code box success: `--green-500` border (briefly)
- Trust device checkbox: `--blue-600` when checked
- Error text: `--red-600`
- Lockout modal: `--orange-600` for warning elements
- Countdown timer: `--gray-700` monospace font
