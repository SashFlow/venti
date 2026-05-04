# MOB-001: Login and Site Selection - Component Specification

## 1. Screen Reference
- **Screen ID**: MOB-001
- **Screen Name**: Login and Site Selection
- **Related Base Spec**: `../../mobile-screen-specs/MOB-001 Login and Site Selection.md`
- **Deep Link**: `venti://auth/login`

## 2. Component Inventory
### Primary Components
1. Email Input, 2. Password Input, 3. Site Selector Dropdown, 4. Role Selector Dropdown, 5. Continue Button

### Secondary Components
6. Language Selector, 7. Support Link, 8. Last Login Display, 9. Network Status Chip

## 3. Data Schema
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Email format |
| password | string | Yes | Min 1 char |
| siteId | string | Yes | From user's sites |
| roleId | string | Yes | From user's roles |

## 4. Layout - Mobile Optimized
- **Pattern**: Single-column form, progressive disclosure
- **Input height**: 56px (thumb-friendly)
- **Spacing**: 20px between sections
- **Footer**: Sticky continue button

## 5. Key Components
- **Email/Password**: Large inputs (56px), auto-capitalize off, secure entry
- **Site Selector**: Modal picker (iOS-style), shows warehouse code + name
- **Continue Button**: Full-width, 56px, disabled until all fields valid
- **Network Status**: Chip at top, red/yellow/green indicator

## 6. Mobile Considerations
- **One-handed**: Yes, thumb zone optimized
- **Keyboard**: Email keyboard for email, secure for password
- **Auto-advance**: Site selector appears after auth, role after site
- **Offline**: Not supported (online auth required)
