# AUTH-004: MFA Enrollment - Component Specification

## 1. Screen Reference
- **Screen ID**: AUTH-004
- **Screen Name**: MFA Enrollment
- **Related Base Spec**: `../auth-screen-specs/AUTH-004 MFA Enrollment.md`
- **Route**: `/auth/mfa/enroll`

---

## 2. Component Inventory

### Primary Components
1. **Step Progress Indicator** (Stepper) - 1 of 4, 2 of 4, etc.
2. **QR Code Display** (Image/Canvas) - TOTP secret as QR code
3. **Manual Entry Code** (Text/Copyable) - Alternative to QR scan
4. **6-Digit Verification Input** (OTP Input) - Test code entry
5. **Backup Codes Display** (Code List) - Recovery codes
6. **Primary CTA** (Button) - Next/Verify/Finish depending on step

### Secondary Components
7. **Authenticator App Links** (Button Group) - App store links
8. **Copy Button** (IconButton) - Copy manual code
9. **Download Backup Codes** (Button) - Download as PDF/TXT
10. **Print Backup Codes** (Button) - Print codes
11. **Skip Link** (Link) - Skip enrollment if policy allows

### Tertiary Components
12. **Help/Info Tooltips** (Popover) - Contextual help at each step
13. **Security Warning** (Alert) - Store backup codes securely message

---

## 3. Data Schema

| Field Name | Type | Required | Validation | Default Value | Display Format |
|------------|------|----------|------------|---------------|----------------|
| `qrCodeData` | string (Data URL) | Yes | Generated server-side | null | Image |
| `manualEntryCode` | string | Yes | 32-char base32 | null | Grouped (XXXX XXXX XXXX...) |
| `verificationCode` | string | Yes | 6 digits | null | 6 separate boxes |
| `backupCodes` | string[] | Yes | 10 codes, 8 chars each | null | List with copy buttons |

---

## 4. Layout Specification

**Pattern**: Centered card with stepped flow
**Card Max Width**: 520px (wider for QR code)

**Step Layouts**:

**Step 1 - Install App**:
```
Progress: [1] - 2 - 3 - 4

Install Authenticator App
[Description text]
[App Store Buttons]
[Supported apps list]

[Next Button]
```

**Step 2 - Scan QR Code**:
```
Progress: 1 - [2] - 3 - 4

Scan QR Code
[Large QR Code - 256x256px]
--- OR ---
[Manual Entry Code with copy button]

[Next Button]
```

**Step 3 - Verify**:
```
Progress: 1 - 2 - [3] - 4

Verify Code
Enter the 6-digit code from your authenticator app
[6-digit input boxes]

[Verify Button]
```

**Step 4 - Backup Codes**:
```
Progress: 1 - 2 - 3 - [4]

Save Your Backup Codes
[Warning alert]
[10 backup codes in grid]
[Download] [Print] buttons

[Finish Setup Button]
```

---

## 5. Component Details

### Step Progress Indicator
- **Type**: Stepper
- **Size**: Full width, 60px height
- **States**: Completed (checkmark), current (filled circle), pending (empty circle)
- **Content**: Step 1, 2, 3, 4 with labels
- **Style**: Horizontal with connecting lines

### QR Code Display
- **Type**: Image (generated from TOTP secret)
- **Size**: 256x256px, centered
- **Border**: 2px solid gray, 8px padding
- **States**: Loading (skeleton), generated, error (fallback to manual code only)
- **Refresh**: Button to regenerate if generation fails

### Manual Entry Code
- **Type**: Text (monospace, grouped)
- **Size**: Full width, centered, large font (18px)
- **Format**: `XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX` (spaces every 4 chars)
- **Copy Button**: Icon button next to code, shows "Copied!" feedback
- **Background**: Light gray box for visual distinction

### 6-Digit Verification Input
- **Type**: OTP Input (6 separate boxes)
- **Size**: Each box 48x56px, 8px gap between
- **States**: Empty, filled, focus, error, success
- **Behavior**: 
  - Auto-focus first box
  - Auto-advance to next box on digit entry
  - Backspace moves to previous box
  - Paste entire code distributes across boxes
- **Validation**: Real-time, shows error shake on invalid code

### Backup Codes Display
- **Type**: Grid of text codes
- **Layout**: 2 columns x 5 rows on desktop, 1 column on mobile
- **Each Code**: 
  - Format: `XXXX-XXXX` (8 characters with hyphen)
  - Monospace font, 16px
  - Copy icon button on hover
- **Container**: Light background with border, clear visual emphasis

### Download Backup Codes Button
- **Type**: Button
- **Variant**: Secondary (outlined)
- **Content**: "Download" + download icon
- **Action**: Generates and downloads TXT or PDF with codes
- **Filename**: `venti-mfa-backup-codes-[date].txt`

### Print Backup Codes Button
- **Type**: Button
- **Variant**: Secondary (outlined)
- **Content**: "Print" + printer icon
- **Action**: Opens print dialog with formatted codes page

---

## 6. Modal/Drawer/Popover Specifications

### QR Generation Failed Modal
- **Trigger**: Server fails to generate QR code
- **Size**: 380px width
- **Header**: "Unable to Generate QR Code"
- **Body**: "Please use the manual entry code below instead." + [manual code]
- **Footer**: "Copy Code" button, "Continue" button

### Verification Failed Modal
- **Trigger**: 3 consecutive failed verification attempts
- **Size**: 400px width
- **Header**: "Verification Failed"
- **Body**: "Unable to verify the code. Please ensure your device time is synchronized and try again."
- **Footer**: 
  - "Try Again" (reset attempts)
  - "Use Manual Code" (jump back to Step 2)
  - "Cancel Setup" (exit enrollment)

---

## 7. Interaction Flows

### Flow 1: Successful Enrollment
1. Land on Step 1 → Show app installation instructions
2. Click Next → Navigate to Step 2
3. QR code generates → User scans with phone app
4. Click Next → Navigate to Step 3
5. User enters 6-digit code from app → Auto-submit when 6 digits entered
6. Code verifies successfully → Navigate to Step 4
7. Backup codes displayed → User downloads/prints
8. Click Finish Setup → MFA enabled, navigate to AUTH-007 or dashboard

### Flow 2: Manual Entry Path
1. User unable to scan QR (no camera, scanner issues)
2. User copies manual entry code → Enters in authenticator app manually
3. Continue with verification (step 3)

### Flow 3: Verification Failure
1. User enters incorrect code → Shake animation, error message
2. After 3 failures → Verification Failed Modal
3. User tries again or switches to manual code entry

---

## 8. State Management

### Local State
- `currentStep`: 1 | 2 | 3 | 4
- `qrCodeUrl`: string | null
- `manualCode`: string | null
- `verificationCode`: string (6 chars)
- `backupCodes`: string[]
- `isVerifying`: boolean
- `verificationAttempts`: number
- `isComplete`: boolean

### Data Fetching
- **POST `/api/auth/mfa/enroll/start`**
  - Response: `{ qrCodeUrl, manualCode, tempSecret }`
  - Initializes MFA setup
- **POST `/api/auth/mfa/enroll/verify`**
  - Request: `{ tempSecret, verificationCode }`
  - Response: `{ success, backupCodes }` or `{ error }`
- **POST `/api/auth/mfa/enroll/complete`**
  - Request: `{ confirmed: true }`
  - Response: `{ mfaEnabled: true }`
  - Finalizes enrollment

---

## 9. Accessibility Notes

- Stepper announced as "Step X of 4: [Step Name]"
- QR code has `alt` text: "QR code to scan with authenticator app"
- Manual code is selectable and copy-able via keyboard (Ctrl/Cmd+C)
- OTP input boxes: Announced as "Enter 6-digit code, digit X of 6"
- Backup codes: Each code announced with copy button
- Navigation between steps uses keyboard (Tab, Enter)

---

## 10. Responsive Behavior

- **Desktop**: QR code large (256px), backup codes in 2 columns
- **Tablet**: QR code medium (224px), backup codes in 2 columns
- **Mobile**: QR code smaller (192px), backup codes in 1 column, buttons stack vertically

---

## 11. Design Tokens Reference

- QR code border: `--gray-300`, padding 8px
- Manual code background: `--gray-100`, `--mono-font`
- OTP boxes: Focus ring `--blue-500`, error shake animation
- Backup codes: Background `--yellow-50`, border `--yellow-300` (emphasize importance)
- Success checkmark (stepper): `--green-600`
- Warning alert (backup codes): `--yellow-600` border
