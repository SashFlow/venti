# AUTH-001: Web Login and Workspace Selection - Component Specification

## 1. Screen Reference
- **Screen ID**: AUTH-001
- **Screen Name**: Web Login and Workspace Selection
- **Related Base Spec**: `../auth-screen-specs/AUTH-001 Web Login and Workspace Selection.md`
- **Route**: `/auth/login`

---

## 2. Component Inventory

### Primary Components (Critical Path)
1. **Email Input Field** (TextInput) - User email entry
2. **Password Input Field** (PasswordInput) - Password entry with visibility toggle
3. **Sign In Button** (Button/Primary) - Submit credentials
4. **SSO Provider Buttons** (Button/Secondary) - Google, Microsoft, Okta SSO options

### Secondary Components
6. **Remember Me Checkbox** (Checkbox) - Persist login session
7. **Forgot Password Link** (Link) - Navigate to AUTH-002
8. **Language Selector** (Dropdown) - Change UI language
9. **Loading Spinner** (Spinner) - During authentication request
10. **Error Banner** (Alert/Error) - Display authentication errors

### Tertiary Components
11. **Terms of Service Link** (Link) - Footer legal link
12. **Privacy Policy Link** (Link) - Footer legal link
13. **Version Number** (Text) - Build/version in footer
14. **Support Link** (Link) - Help/contact support

### Modal/Overlay Components
15. **Network Error Modal** - Connection failure notification
16. **Account Locked Modal** - Account suspension/lock details

---

## 3. Data Schema

| Field Name | Type | Required | Validation | Default Value | Display Format |
|------------|------|----------|------------|---------------|----------------|
| `email` | string | Yes | Email format, max 255 chars | null | lowercase trim |
| `password` | string | Yes | Min 1 char (validated server-side) | null | masked |
| `rememberMe` | boolean | No | N/A | false | checkbox |
| `workspaceId` | string | Yes (after auth) | Must be in user's workspace list | null | UUID or slug |
| `language` | string | No | ISO 639-1 code | `en` | language name |

---

## 4. Layout Specification

### Container Structure
- **Pattern**: Centered card layout on full-screen background
- **Card Max Width**: 420px
- **Background**: Light gradient or solid color with subtle branding

### Grid/Flexbox Details

**Desktop Layout (>1280px)**:
```
[Header: Logo + Language Selector]
       [Centered Login Card]
           Email Input
           Password Input
           Remember Me + Forgot Password
           Sign In Button
           --- OR ---
           [SSO Buttons Grid]
       [Footer: Legal Links + Version]
```

**Tablet/Mobile (<1280px)**:
- Same layout, card adapts to smaller width (min 320px)
- Footer links stack vertically on small mobile

### Spacing System
- Card padding: 32px (desktop), 24px (mobile)
- Input vertical gap: 16px
- Section gap (credentials → SSO): 24px
- Footer top margin: 48px

---

## 5. Component Details

### Email Input Field
- **Type**: Text Input
- **Variant**: Standard form input
- **Size**: Full width, height 48px
- **States**:
  - Default: Gray border, placeholder visible
  - Focus: Blue border (2px), no placeholder
  - Error: Red border, error message below
  - Disabled: Gray background, cursor not-allowed
- **Content**:
  - Label: "Email Address"
  - Placeholder: "you@company.com"
  - Helper text: None
  - Error message: "Please enter a valid email address"
- **Validation**: 
  - Real-time on blur: Email format
  - Server-side: Account exists (on submit only)
- **Props**:
  - `autocomplete="email"`
  - `type="email"`
  - `required={true}`
  - `aria-label="Email Address"`

### Password Input Field
- **Type**: Password Input with visibility toggle
- **Variant**: Standard form input with icon button
- **Size**: Full width, height 48px
- **States**: Same as email input
- **Content**:
  - Label: "Password"
  - Placeholder: "Enter your password"
  - Toggle icon: Eye (show) / Eye-slash (hide)
  - Error message: "Password is required" or "Invalid credentials"
- **Validation**: Required field only (no client-side strength check for login)
- **Props**:
  - `autocomplete="current-password"`
  - `type="password"` (toggleable to `type="text"`)
  - `required={true}`
  - `aria-label="Password"`
- **Interactions**:
  - Toggle button click: Switch between masked/visible
  - Enter key: Submit form

### Sign In Button
- **Type**: Button
- **Variant**: Primary (solid, high emphasis)
- **Size**: Full width, height 48px
- **States**:
  - Default: Blue background, white text
  - Hover: Darker blue, subtle scale (1.02x)
  - Focus: Blue with focus ring
  - Active: Pressed state (scale 0.98x)
  - Loading: Spinner replaces text, disabled state
  - Disabled: Gray background, gray text, no pointer
- **Content**: "Sign In"
- **Loading State**: White spinner + "Signing in..." text
- **Interactions**:
  - Click: Submit login form
  - Enter key (from inputs): Submit form

### SSO Provider Buttons
- **Type**: Button (group of 1-3 buttons)
- **Variant**: Secondary (outlined or light fill with provider branding)
- **Size**: Full width (stacked) or grid (2 columns if multiple), height 44px each
- **States**: Same hover/focus as primary button
- **Content**:
  - Icon: Provider logo (Google G, Microsoft window, Okta logo)
  - Text: "Continue with [Provider]"
- **Interactions**:
  - Click: Redirect to SSO provider auth flow
  - Open in same window (not popup)

### Workspace Selector (Post-Auth)
- **Type**: Dropdown/Select
- **Variant**: Full-width select with search (if >5 workspaces)
- **Size**: Full width, height 48px
- **States**: Default, focus, open (dropdown expanded), disabled
- **Content**:
  - Label: "Select Workspace"
  - Options: Workspace name + warehouse code
  - Placeholder: "Choose your workspace..."
  - No selection: Dropdown remains open until selection
- **Data**:
  - Each option: `{ id, name, warehouseCode, icon? }`
- **Interactions**:
  - Select option: Auto-navigate to workspace dashboard
  - Search (if enabled): Filter workspaces by name/code
- **Display**: Appears only after successful authentication, replaces login form

### Remember Me Checkbox
- **Type**: Checkbox with label
- **Variant**: Standard checkbox
- **Size**: 20px checkbox, label inline
- **States**: Unchecked, checked, focus, disabled
- **Content**: "Remember me for 30 days"
- **Placement**: Below password field, left-aligned

### Forgot Password Link
- **Type**: Link
- **Variant**: Text link (no underline default, underline on hover)
- **Size**: Small text (14px)
- **Content**: "Forgot password?"
- **Placement**: Below password field, right-aligned (opposite Remember Me)
- **Interactions**: Click → Navigate to AUTH-002

### Error Banner
- **Type**: Alert Banner
- **Variant**: Error (red background, red border, error icon)
- **Size**: Full width of card, auto height
- **Placement**: Top of card, above email input (when visible)
- **Content**:
  - Icon: Error circle with X
  - Text: Dynamic error message
  - Dismiss button: X icon (optional, auto-dismiss on retry)
- **Common Messages**:
  - "Invalid email or password"
  - "Your account has been locked. Please contact support."
  - "Unable to connect. Please check your connection."
  - "Too many login attempts. Please try again in 15 minutes."

---

## 6. Modal/Drawer/Popover Specifications

### Account Locked Modal
- **Trigger**: Server returns account locked error on login attempt
- **Size**: 400px width, auto height, centered
- **Dismissal**: Close button only (no outside click, must acknowledge)
- **Header**: 
  - Icon: Lock icon (warning orange)
  - Title: "Account Locked"
- **Body**:
  - Message: "[Reason for lock]" (from server)
  - Instructions: "Please contact your administrator or support team for assistance."
  - Support email/link
- **Footer**:
  - Primary button: "Contact Support" (opens email client or support form)
  - Secondary button: "Close" (returns to login form)
- **States**: Loading (rare), default

### Network Error Modal
- **Trigger**: Network request fails during auth attempt
- **Size**: 380px width, auto height, centered
- **Dismissal**: Close button, outside click allowed, escape key
- **Header**:
  - Icon: Wifi/connection icon (red)
  - Title: "Connection Error"
- **Body**:
  - Message: "Unable to connect to the server. Please check your internet connection and try again."
  - Optional: Network diagnostics hint
- **Footer**:
  - Primary button: "Retry" (re-attempt login)
  - Secondary button: "Cancel" (close modal, stay on login form)
- **States**: Default only

---

## 7. Interaction Flows

### Flow 1: Standard Email/Password Login
1. User enters email → Client validates format on blur → Show validation error if invalid
2. User enters password → Enable Sign In button
3. User clicks Sign In → Button shows loading state → Form disabled
4. Server validates credentials:
   - **Success**: Form hidden → Workspace selector appears (if multiple workspaces) or auto-navigate (if single workspace)
   - **Error**: Error banner appears → Form re-enabled → Password field cleared → Focus on email
5. User selects workspace (if applicable) → Navigate to dashboard

### Flow 2: SSO Login
1. User clicks "Continue with [Provider]" → Button shows loading state
2. Browser redirects to SSO provider → User authenticates externally
3. Provider redirects back with token → Auto-validate token
4. Success: Workspace selector appears or auto-navigate
5. Error: Return to login with error banner explaining SSO failure

### Flow 3: Forgot Password
1. User clicks "Forgot password?" link → Navigate to AUTH-002
2. (No return flow; user follows password reset flow)

### Flow 4: Account Locked
1. User submits credentials → Server returns locked error
2. Account Locked Modal appears → User reads message
3. User clicks "Contact Support" or "Close" → Modal closes, return to login form

---

## 8. State Management

### Local State
- `email`: string - Current email input value
- `password`: string - Current password input value
- `rememberMe`: boolean - Remember me checkbox state
- `isLoading`: boolean - Form submission in progress
- `error`: string | null - Current error message
- `availableWorkspaces`: Workspace[] | null - Post-auth workspace list
- `selectedWorkspace`: string | null - Selected workspace ID
- `showPassword`: boolean - Password visibility toggle

### Shared/Global State
- `currentUser`: User | null - Authenticated user object (after login)
- `authToken`: string | null - JWT or session token
- `workspaceContext`: Workspace | null - Selected workspace context

### Data Fetching
- **POST `/api/auth/login`**: Submit credentials
  - Request: `{ email, password, rememberMe }`
  - Response: `{ token, user, workspaces[] }` or `{ error }`
  - Loading: Show button spinner, disable form
  - Error: Display error banner, re-enable form
- **GET `/api/auth/sso/:provider`**: Initiate SSO flow
  - Redirects to provider, no direct response
- **POST `/api/auth/workspace`**: Set workspace context
  - Request: `{ workspaceId }`
  - Response: `{ workspace }` or redirect
  - Loading: Show workspace selector loading state

---

## 9. Accessibility Notes

### Keyboard Navigation
- **Tab order**: Email → Password → Remember Me → Forgot Password → Sign In → SSO buttons → Language selector
- **Shortcuts**: Enter key on inputs submits form
- **Focus management**: First field (email) auto-focused on page load; after error, focus returns to email

### Screen Reader Support
- Form has `<form>` tag with `aria-label="Sign in to your account"`
- Each input has proper `<label>` association
- Error messages have `role="alert"` and are announced immediately
- Loading state announced: "Signing in, please wait"
- Workspace selector has `aria-label="Select your workspace"`

### Visual Accessibility
- **Color contrast**: All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **Focus indicators**: Blue outline (2px) on all interactive elements
- **Text sizing**: Base 16px, scales up to 200% without breaking layout
- **Error indicators**: Not color-only (icon + text)

---

## 10. Responsive Behavior

### Desktop (>1280px)
- Login card centered, max-width 420px
- All components at full specified sizes
- Footer links horizontal

### Tablet (768-1279px)
- Login card width 90vw, max 420px
- Component sizes unchanged
- Footer may wrap to 2 lines

### Mobile (<768px)
- Login card width 100vw (edge-to-edge with 16px horizontal padding)
- Card padding reduced to 24px
- SSO buttons stack vertically (if multiple)
- Footer links stack vertically
- Language selector moves to menu icon

---

## 11. Design Tokens Reference

### Colors
- **Primary Action**: `--blue-600` (#2563EB)
- **Primary Hover**: `--blue-700` (#1D4ED8)
- **Error**: `--red-600` (#DC2626)
- **Error Background**: `--red-50` (#FEF2F2)
- **Success**: `--green-600` (#059669)
- **Text Primary**: `--gray-900` (#111827)
- **Text Secondary**: `--gray-600` (#4B5563)
- **Border Default**: `--gray-300` (#D1D5DB)
- **Border Focus**: `--blue-500` (#3B82F6)

### Typography
- **Input Label**: 14px, font-weight 500, gray-700
- **Input Text**: 16px, font-weight 400, gray-900
- **Button Text**: 16px, font-weight 600
- **Error Text**: 14px, font-weight 400, red-600
- **Link Text**: 14px, font-weight 500, blue-600

### Spacing
- Card padding: 32px (desktop), 24px (mobile)
- Input gap: 16px
- Label-to-input gap: 6px
- Button height: 48px
- Input height: 48px

### Shadows & Elevations
- **Card shadow**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
- **Modal shadow**: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`
- **Focus ring**: `0 0 0 3px rgb(59 130 246 / 0.5)`

### Borders & Radii
- **Card border radius**: 12px
- **Input border radius**: 8px
- **Button border radius**: 8px
- **Modal border radius**: 16px
- **Border width**: 1px (default), 2px (focus)
