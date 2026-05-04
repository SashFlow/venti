# AUTH-008: User Invitation Acceptance - Component Specification

## 1. Screen Reference
- **Screen ID**: AUTH-008
- **Screen Name**: User Invitation Acceptance
- **Related Base Spec**: `../auth-screen-specs/AUTH-008 User Invitation Acceptance.md`
- **Route**: `/auth/accept-invitation?token=:token`

---

## 2. Component Inventory

### Primary Components
1. **Step Progress Indicator** (Stepper) - Step 1 of 4, 2 of 4, etc.
2. **Password Setup Form** (PasswordInput Group) - New password + confirm
3. **Terms Acceptance Checkbox** (Checkbox) - Required terms agreement
4. **Profile Information Form** (Input Group) - Name, phone, optional fields
5. **Primary CTA** (Button) - Next / Complete Setup

### Secondary Components
6. **Invitation Context Card** (Info Card) - Who invited, to which workspace
7. **Password Strength Meter** (Progress) - Same as AUTH-003
8. **Requirements Checklist** (List) - Password criteria
9. **Profile Photo Upload** (Image Upload) - Optional avatar
10. **Back Button** (Button/Ghost) - Navigate to previous step

### Tertiary Components
11. **Terms of Service Link** (Link) - Opens full ToS in new tab
12. **Privacy Policy Link** (Link) - Opens privacy policy
13. **Role Preview Badge** (Badge) - Shows assigned role
14. **Skip Optional Fields Link** (Link) - Skip profile completion

---

## 3. Data Schema

| Field Name | Type | Required | Validation | Default Value | Display Format |
|------------|------|----------|------------|---------------|----------------|
| `invitationToken` | string | Yes (URL param) | JWT format | null | hidden |
| `password` | string | Yes | Min 8, complexity rules | null | masked |
| `confirmPassword` | string | Yes | Match password | null | masked |
| `termsAccepted` | boolean | Yes | Must be true | false | checkbox |
| `firstName` | string | Yes | Max 50 chars | null | Capitalized |
| `lastName` | string | Yes | Max 50 chars | null | Capitalized |
| `phone` | string | No | Phone format | null | Formatted |
| `profilePhoto` | File | No | Image, max 5MB | null | Upload preview |
| `inviterName` | string | Yes (context) | N/A | From invitation | Display only |
| `workspaceName` | string | Yes (context) | N/A | From invitation | Display only |
| `assignedRole` | string | Yes (context) | N/A | From invitation | Badge |

---

## 4. Layout Specification

**Pattern**: Centered card with multi-step flow
**Card Max Width**: 540px

**Step Layouts**:

**Step 1 - Welcome**:
```
Progress: [1] - 2 - 3 - 4

Welcome to Venti!
You've been invited by [Inviter Name]
to join [Workspace Name]

[Invitation Context Card]
  Invited by: [Name]
  Organization: [Name]
  Role: [Badge]

[Continue Button]
```

**Step 2 - Set Password**:
```
Progress: 1 - [2] - 3 - 4

Create Your Password

[Requirements Checklist]

New Password [+toggle]
[Strength Meter]

Confirm Password [+toggle]

[Back] [Next]
```

**Step 3 - Accept Terms**:
```
Progress: 1 - 2 - [3] - 4

Terms and Privacy

Please review and accept our terms

☐ I agree to the Terms of Service
    and Privacy Policy
    [Links open in new tab]

[Back] [Next]
```

**Step 4 - Complete Profile**:
```
Progress: 1 - 2 - 3 - [4]

Complete Your Profile

[Profile Photo Upload Circle]

First Name *    Last Name *
[Input]         [Input]

Phone (optional)
[Input]

[Skip] [Complete Setup]
```

---

## 5. Component Details

### Step Progress Indicator
- **Type**: Stepper
- **Size**: Full width, 64px height
- **Style**: Circles connected by lines
- **States**: Completed (checkmark, green), current (filled, blue), pending (outline, gray)
- **Labels**: "Welcome", "Password", "Terms", "Profile"
- **Responsive**: Shrinks on mobile, may show only current step number

### Invitation Context Card
- **Type**: Info Card
- **Size**: Full width within card
- **Style**: Light background, border, padding
- **Content**:
  - Icon: Envelope or invitation icon
  - Invited by: [Inviter name + avatar if available]
  - Organization: [Workspace name]
  - Role: [Badge showing assigned role]
  - Expiration: "Invitation expires in X days" (if applicable)
- **Placement**: Step 1 only

### Password Setup Form (Step 2)
- **Components**:
  - Requirements checklist (same as AUTH-003, always visible)
  - New password input with visibility toggle
  - Strength meter (4-level: weak/fair/good/strong)
  - Confirm password input with visibility toggle
  - Real-time validation
- **Layout**: Vertically stacked, 16px gaps
- **Validation**: Passwords must match and meet all requirements before Next enabled

### Terms Acceptance Checkbox (Step 3)
- **Type**: Checkbox with multi-line label
- **Size**: Large checkbox (24px), label wraps
- **Content**: "I agree to the [Terms of Service] and [Privacy Policy]"
  - Links are blue, open in new tab
  - Links have external link icon
- **Required**: Must be checked to proceed
- **Validation**: Shows error if user tries to proceed without checking
- **Error Message**: "You must accept the terms to continue"

### Profile Information Form (Step 4)
- **Fields**:
  - Profile Photo (optional): Drag-drop upload, file picker, or camera
  - First Name (required): Text input
  - Last Name (required): Text input
  - Phone (optional): Phone input with format helper
- **Layout**: Photo centered at top, name fields in 2-column grid (stacked on mobile), phone full width
- **Validation**: First and last name required to complete

### Complete Setup Button
- **Type**: Button
- **Variant**: Primary
- **Size**: Full width, 48px
- **Content**: "Complete Setup" or "Completing..." (loading)
- **Disabled When**: Required fields empty or validation errors
- **Success**: Celebratory animation → Auto-sign-in → Navigate to onboarding or dashboard

### Skip Link
- **Type**: Link
- **Placement**: Bottom left of step 4, opposite Complete button
- **Content**: "Skip for now"
- **Action**: Proceeds with setup without optional fields (phone, photo)
- **Note**: User can complete profile later in AUTH-007

---

## 6. Modal/Drawer/Popover Specifications

### Invalid Token Modal
- **Trigger**: Token validation fails on page load
- **Size**: 420px width
- **Header**: "Invalid Invitation"
- **Body**: 
  - Icon: Warning (red)
  - Message: "This invitation link is invalid or has expired. Please contact your administrator for a new invitation."
  - Support email/contact if configured
- **Footer**: "Contact Support" | "Close"
- **Dismissal**: Button only (no backdrop click)

### Already Accepted Modal
- **Trigger**: Token already used
- **Size**: 380px width
- **Header**: "Invitation Already Used"
- **Body**: "This invitation has already been accepted. Would you like to sign in instead?"
- **Footer**: "Sign In" (navigate to AUTH-001) | "Close"

### Success Celebration Modal
- **Trigger**: Account successfully created
- **Size**: 460px width
- **Header**: "Welcome to Venti!" with celebration animation/confetti
- **Body**:
  - Success checkmark (animated)
  - "Your account has been created successfully!"
  - "You're now signed in and ready to get started."
- **Footer**: "Get Started" button
- **Auto-dismiss**: After 3s or button click → Navigate to dashboard
- **Dismissal**: Button click or countdown

---

## 7. Interaction Flows

### Flow 1: Successful Invitation Acceptance
1. User clicks invitation link from email → Lands on page
2. System validates token → Valid
3. Step 1 (Welcome) appears → Shows invitation context
4. User clicks Continue → Navigate to Step 2
5. User sets password → Requirements met, passwords match
6. User clicks Next → Navigate to Step 3
7. User checks Terms acceptance → Next enabled
8. User clicks Next → Navigate to Step 4
9. User completes profile (optional photo) → Fills required fields
10. User clicks Complete Setup → Loading state
11. Server creates account → Success
12. Success Celebration Modal → Auto-sign-in → Navigate to dashboard

### Flow 2: Invalid/Expired Token
1. User clicks link → System validates token → Invalid/Expired
2. Invalid Token Modal appears immediately
3. User clicks "Contact Support" or "Close"
4. Cannot proceed without valid token

### Flow 3: Skip Optional Profile Fields
1. User reaches Step 4 → Fills only First and Last name
2. User clicks "Skip for now" → Skips photo and phone
3. Account created with minimal info
4. User can complete profile later in AUTH-007

### Flow 4: Navigate Back to Edit
1. User on Step 3 or 4 → Clicks Back button
2. Returns to previous step with data preserved
3. Can edit and proceed again

---

## 8. State Management

### Local State
- `currentStep`: 1 | 2 | 3 | 4
- `token`: string (from URL)
- `tokenValid`: boolean
- `invitationData`: { inviterName, workspaceName, role, expiresAt }
- `password`: string
- `confirmPassword`: string
- `passwordStrength`: 'weak' | 'fair' | 'good' | 'strong'
- `requirements`: { min8, upper, lower, number, special }
- `termsAccepted`: boolean
- `profile`: { firstName, lastName, phone, photo }
- `isCompleting`: boolean
- `error`: string | null

### Data Fetching
- **POST `/api/auth/invitation/validate`**
  - Request: `{ token }`
  - Response: `{ valid: true, invitationData }` or `{ valid: false, reason }`
  - On page load
- **POST `/api/auth/invitation/accept`**
  - Request: `{ token, password, termsAccepted, profile }`
  - Response: `{ authToken, user, workspace }` or `{ error }`
  - On Complete Setup
- **POST `/api/upload/profile-photo`** (optional)
  - Request: FormData with image
  - Response: `{ photoUrl }` or `{ error }`
  - During profile completion

---

## 9. Accessibility Notes

- Stepper: Announced as "Step X of 4: [Step Name]"
- Progress: Visual + text indication of current step
- Password requirements: Each requirement announced when met/unmet
- Terms checkbox: Large target (44x44px), clear label association
- Forms: All fields properly labeled, error messages announced
- Skip link: Clearly distinguishable from primary action
- Keyboard navigation: Tab order logical, Enter submits current step

---

## 10. Responsive Behavior

- **Desktop**: Card 540px, stepper horizontal with labels
- **Tablet**: Card 90vw max 540px, stepper remains horizontal
- **Mobile**: Card full width (with padding), stepper may collapse to "Step X of 4" text only, name fields stack vertically

---

## 11. Design Tokens Reference

- Invitation card background: `--blue-50`, border `--blue-200`
- Stepper completed: `--green-600` checkmark
- Stepper current: `--blue-600` filled circle
- Password strength: Same as AUTH-003 (red/yellow/blue/green)
- Terms checkbox: `--blue-600` when checked
- Success celebration: `--green-600` checkmark, confetti animation
- Role badge: `--blue-100` background, `--blue-700` text
