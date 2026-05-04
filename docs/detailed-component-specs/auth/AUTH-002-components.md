# AUTH-002: Forgot Password Flow - Component Specification

## 1. Screen Reference
- **Screen ID**: AUTH-002
- **Screen Name**: Forgot Password Flow
- **Related Base Spec**: `../auth-screen-specs/AUTH-002 Forgot Password Flow.md`
- **Route**: `/auth/forgot-password`

---

## 2. Component Inventory

### Primary Components
1. **Email Input Field** (TextInput) - User email entry for reset
2. **Send Reset Link Button** (Button/Primary) - Submit reset request
3. **Instruction Text** (Text) - Explains the process

### Secondary Components
4. **Back to Sign In Link** (Link) - Return to AUTH-001
5. **Success Confirmation Banner** (Alert/Success) - Email sent confirmation
6. **Loading Spinner** (Spinner) - During request

### Tertiary Components
7. **Help Text** (Text) - Spam folder reminder, delivery time estimate
8. **Resend Button** (Button/Ghost) - Appears after 5 minutes if available

---

## 3. Data Schema

| Field Name | Type | Required | Validation | Default Value | Display Format |
|------------|------|----------|------------|---------------|----------------|
| `email` | string | Yes | Email format, max 255 chars | null | lowercase trim |

---

## 4. Layout Specification

**Pattern**: Centered card, similar to AUTH-001
**Card Max Width**: 420px

**Layout**:
```
[Logo]
[Back Arrow]

Reset Your Password
[Instruction paragraph]

Email Input
Send Reset Link Button

[Back to Sign In Link]
```

**Spacing**: Same as AUTH-001 (32px card padding, 16px input gap)

---

## 5. Component Details

### Email Input Field
- **Type**: Text Input
- **Size**: Full width, 48px height
- **States**: Default, focus, error, disabled
- **Content**:
  - Label: "Email Address"
  - Placeholder: "you@company.com"
  - Error: "Please enter a valid email address"
- **Validation**: Email format on blur
- **Props**: `autocomplete="email"`, `required={true}`

### Send Reset Link Button
- **Type**: Button
- **Variant**: Primary
- **Size**: Full width, 48px height
- **States**: Default, hover, focus, loading, disabled
- **Content**: "Send Reset Link"
- **Loading State**: Spinner + "Sending..."
- **Disabled**: When email invalid or request in progress

### Success Confirmation Banner
- **Type**: Alert
- **Variant**: Success (green)
- **Placement**: Replaces form after successful submission
- **Content**:
  - Icon: Checkmark circle
  - Title: "Check Your Email"
  - Message: "We've sent a password reset link to [email]. Please check your inbox and spam folder."
  - Subtext: "The link will expire in 24 hours."
- **Actions**: "Back to Sign In" button

### Back to Sign In Link
- **Type**: Link
- **Size**: 14px text
- **Placement**: Below button, centered
- **Content**: "← Back to Sign In"
- **Interaction**: Navigate to AUTH-001

---

## 6. Modal/Drawer/Popover Specifications

### Rate Limit Modal
- **Trigger**: Server returns rate limit error (too many requests)
- **Size**: 380px width, auto height
- **Header**: "Too Many Requests"
- **Body**: "You've requested too many password resets. Please wait 15 minutes and try again."
- **Footer**: "OK" button to dismiss
- **Countdown**: Shows time remaining if available

---

## 7. Interaction Flows

### Flow 1: Successful Reset Request
1. User enters email → Validates format
2. User clicks Send Reset Link → Button loading state
3. Server processes request → Returns success (even if email not found, for security)
4. Success banner replaces form → Shows confirmation message
5. User can click "Back to Sign In" → Navigate to AUTH-001

### Flow 2: Rate Limited
1. User submits multiple requests within short time
2. Server returns rate limit error
3. Rate Limit Modal appears → Shows wait time
4. User clicks OK → Modal closes, form re-enabled after wait time

---

## 8. State Management

### Local State
- `email`: string - Email input value
- `isLoading`: boolean - Request in progress
- `isSuccess`: boolean - Request successfully submitted
- `error`: string | null - Error message
- `canResend`: boolean - Whether resend is allowed (after 5 min)

### Data Fetching
- **POST `/api/auth/forgot-password`**
  - Request: `{ email }`
  - Response: `{ success: true }` (generic for security)
  - Error: Rate limit, network errors only

---

## 9. Accessibility Notes

- Form labeled: `aria-label="Request password reset"`
- Success message has `role="alert"` for screen reader announcement
- Focus management: Email field auto-focused on load, "Back to Sign In" focused after success
- Keyboard: Enter submits form

---

## 10. Responsive Behavior

- Same responsive patterns as AUTH-001
- Card adapts to mobile (100vw with padding)
- Text wraps appropriately on small screens

---

## 11. Design Tokens Reference

- Uses same color, typography, and spacing tokens as AUTH-001
- Success green: `--green-600` (#059669)
- Success background: `--green-50` (#ECFDF5)
