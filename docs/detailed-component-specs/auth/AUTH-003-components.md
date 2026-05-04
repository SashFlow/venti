# AUTH-003: Password Reset Page - Component Specification

## 1. Screen Reference
- **Screen ID**: AUTH-003
- **Screen Name**: Password Reset Page
- **Related Base Spec**: `../auth-screen-specs/AUTH-003 Password Reset Page.md`
- **Route**: `/auth/reset-password?token=:token`

---

## 2. Component Inventory

### Primary Components
1. **New Password Input** (PasswordInput) - New password entry
2. **Confirm Password Input** (PasswordInput) - Password confirmation
3. **Password Strength Meter** (Progress/Indicator) - Visual strength feedback
4. **Requirements Checklist** (List) - Password criteria with check/x indicators
5. **Reset Password Button** (Button/Primary) - Submit new password

### Secondary Components
6. **Password Visibility Toggles** (IconButton) - Show/hide for both fields
7. **Token Validation Indicator** (Status) - Valid/expired token status
8. **Success Modal** (Modal) - Confirmation after successful reset

### Tertiary Components
9. **Security Badge** (Icon) - Visual security indicator in header
10. **Return to Login Link** (Link) - After success or token error

---

## 3. Data Schema

| Field Name | Type | Required | Validation | Default Value | Display Format |
|------------|------|----------|------------|---------------|----------------|
| `token` | string | Yes (URL param) | JWT format | null | hidden |
| `newPassword` | string | Yes | Min 8 chars, 1 upper, 1 lower, 1 number, 1 special | null | masked |
| `confirmPassword` | string | Yes | Must match newPassword | null | masked |

---

## 4. Layout Specification

**Pattern**: Centered card
**Card Max Width**: 480px (slightly wider for requirement checklist)

**Layout**:
```
[Logo + Security Badge]

Create New Password
[Token valid indicator]

Password Requirements Checklist
New Password Input [+toggle]
[Strength Meter]
Confirm Password Input [+toggle]

Reset Password Button

[Success Modal on completion]
```

---

## 5. Component Details

### New Password Input
- **Type**: Password Input with visibility toggle
- **Size**: Full width, 48px
- **States**: Default, focus, error, valid, disabled
- **Content**:
  - Label: "New Password"
  - Placeholder: "Enter new password"
  - Error: "Password does not meet requirements"
- **Validation**: Real-time as user types
- **Visual Feedback**: Border color changes based on strength (red → yellow → green)

### Password Strength Meter
- **Type**: Progress Bar
- **Size**: Full width, 4px height, below new password field
- **States**: 
  - Weak: Red, 25% filled
  - Fair: Yellow, 50% filled
  - Good: Blue, 75% filled
  - Strong: Green, 100% filled
- **Updates**: Real-time as user types
- **Content**: Label shows strength level text

### Requirements Checklist
- **Type**: Unordered List
- **Items**:
  - ✓/✗ At least 8 characters
  - ✓/✗ One uppercase letter
  - ✓/✗ One lowercase letter
  - ✓/✗ One number
  - ✓/✗ One special character (@$!%*?&)
- **States**: Each item dynamically shows check (green) or X (gray) based on password
- **Placement**: Above new password input, always visible
- **Style**: Small text (13px), compact spacing

### Confirm Password Input
- **Type**: Password Input with visibility toggle
- **Size**: Full width, 48px
- **States**: Default, focus, error, match, disabled
- **Content**:
  - Label: "Confirm Password"
  - Placeholder: "Re-enter new password"
  - Error: "Passwords do not match"
- **Validation**: On blur or real-time after first blur
- **Match Indicator**: Green checkmark appears when passwords match

### Reset Password Button
- **Type**: Button
- **Variant**: Primary
- **Size**: Full width, 48px
- **States**: Default, hover, loading, disabled
- **Disabled When**: Token invalid, passwords don't meet requirements, passwords don't match, or request in progress
- **Loading State**: Spinner + "Resetting Password..."

---

## 6. Modal/Drawer/Popover Specifications

### Token Expired Modal
- **Trigger**: Token validation fails on page load or submission
- **Size**: 400px width
- **Header**: "Link Expired"
- **Body**: 
  - Icon: Warning triangle (orange)
  - Message: "This password reset link has expired or is invalid. Please request a new one."
- **Footer**: 
  - Primary: "Request New Link" (navigate to AUTH-002)
  - Secondary: "Back to Sign In" (navigate to AUTH-001)
- **Dismissal**: Button click only

### Success Modal
- **Trigger**: Password successfully reset
- **Size**: 420px width
- **Header**: "Password Reset Successfully"
- **Body**:
  - Icon: Checkmark (green, animated)
  - Message: "Your password has been changed. You can now sign in with your new password."
  - Auto-redirect countdown: "Redirecting to sign in in 3 seconds..."
- **Footer**: "Sign In Now" button (skip countdown)
- **Auto-dismiss**: After 3 seconds, navigate to AUTH-001
- **Dismissal**: Button click or countdown

---

## 7. Interaction Flows

### Flow 1: Successful Password Reset
1. User lands on page with token → System validates token
   - Valid: Show form
   - Invalid: Show Token Expired Modal
2. User types new password → Strength meter updates → Requirements checklist updates
3. User types confirm password → Match validation on blur
4. Both passwords meet requirements and match → Enable Reset Password button
5. User clicks Reset Password → Loading state
6. Server saves new password → Success Modal appears
7. Auto-redirect after 3s or user clicks "Sign In Now" → Navigate to AUTH-001

### Flow 2: Token Expired
1. User lands on page → Token validation fails
2. Token Expired Modal appears immediately
3. User clicks "Request New Link" → Navigate to AUTH-002

### Flow 3: Password Mismatch
1. User fills both fields but they don't match
2. Confirm password field shows red border + error message on blur
3. User corrects → Error clears, button enables when all valid

---

## 8. State Management

### Local State
- `token`: string - From URL params
- `newPassword`: string
- `confirmPassword`: string
- `passwordStrength`: 'weak' | 'fair' | 'good' | 'strong'
- `requirements`: { min8: boolean, upper: boolean, lower: boolean, number: boolean, special: boolean }
- `passwordsMatch`: boolean
- `isLoading`: boolean
- `isTokenValid`: boolean
- `showPassword`: { new: boolean, confirm: boolean }

### Data Fetching
- **POST `/api/auth/reset-password`**
  - Request: `{ token, newPassword }`
  - Response: `{ success: true }` or `{ error }`
  - Validates token server-side
  - Checks password against history

---

## 9. Accessibility Notes

- Form labeled: `aria-label="Create new password"`
- Requirements checklist: Each item announced with status change
- Strength meter has `aria-label` with current strength level
- Success modal announced immediately with `role="alert"`
- Focus: New password field focused on page load
- Keyboard: Enter submits form when valid

---

## 10. Responsive Behavior

- Card width adapts: 480px max, 100vw - 32px on mobile
- Requirements checklist remains readable on small screens (compact spacing)
- Buttons full width on all sizes

---

## 11. Design Tokens Reference

- Strength colors:
  - Weak: `--red-500` (#EF4444)
  - Fair: `--yellow-500` (#F59E0B)
  - Good: `--blue-500` (#3B82F6)
  - Strong: `--green-600` (#059669)
- Requirements:
  - Met: Green checkmark, `--green-600`
  - Unmet: Gray X, `--gray-400`
- All other tokens match AUTH-001
