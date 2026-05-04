# ADM-013: Alert Channel Configuration - Component Specification

## Screen Reference
- **ID**: ADM-013 | **Name**: Alert Channel Configuration
- **Base Spec**: `../../admin-screen-specs/ADM-013 Alert Channel Configuration.md`
- **Route**: `/admin/notifications/channels`

## Component Inventory
**Primary**: 1. Channel Table, 2. Channel Config Forms, 3. Test Functionality
**Secondary**: 4. Delivery Metrics, 5. Retry Policy Config, 6. Multi-Channel Support
**Modals**: Add Channel Dialog, SMTP Settings, Webhook Config, Test Channel

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| channelId | string | UUID |
| channelType | enum | 'in_app','email','sms','webhook' |
| channelName | string | Required, unique |
| config | object | Type-specific settings |
| status | enum | 'active','inactive','error' |
| deliveryRate | number | Success rate % |

## Layout
**Pattern**: Channel list + config panel
**Table**: Channel list by type
**Config**: Right panel for selected channel
**Metrics**: Bottom panel with delivery stats

## Key Components
- **Channel Table**: Name, Type, Status, Delivery Rate, Last Used, Actions
- **Channel Types**: In-App (default), Email (SMTP), SMS (Twilio), Webhook (HTTP)
- **Email Config**: SMTP host, port, username, password, TLS, from address
- **SMS Config**: Provider (Twilio), account SID, auth token, from number
- **Webhook Config**: URL, method (POST), headers, auth (API key/OAuth), payload template
- **Retry Policy**: Max retries, backoff strategy (exponential), timeout
- **Delivery Metrics**: Chart showing sent/delivered/failed counts
- **Test Button**: Send test message to verify configuration
- **Status Indicator**: Active (green), Inactive (gray), Error (red) with error details
- **Enable/Disable Toggle**: Activate or deactivate channel

## Admin-Specific
- **Multi-Channel Support**: Configure multiple delivery channels
- **Retry Logic**: Automatic retry with backoff
- **Delivery Tracking**: Monitor success rates
