# ADM-014: Integration Connector Registry - Component Specification

## Screen Reference
- **ID**: ADM-014 | **Name**: Integration Connector Registry
- **Base Spec**: `../../admin-screen-specs/ADM-014 Integration Connector Registry.md`
- **Route**: `/admin/integrations/connectors`

## Component Inventory
**Primary**: 1. Connector Table, 2. Connector Config Form, 3. Health Dashboard
**Secondary**: 4. Endpoint Config, 5. Auth Settings, 6. Error Rate Metrics
**Modals**: Add Connector Dialog, Test Connection, Health Details

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| connectorId | string | UUID |
| connectorType | enum | 'sap','erp','wms','carrier','marketplace' |
| connectorName | string | Required, unique |
| endpoint | string | Required, URL |
| authType | enum | 'api_key','oauth','basic','none' |
| status | enum | 'healthy','degraded','error','disabled' |
| errorRate | number | Percentage |

## Layout
**Pattern**: Table with health dashboard
**Dashboard**: Top panel with connector health summary
**Table**: Connector list
**Config**: Right panel for selected connector

## Key Components
- **Health Dashboard**: Overall health indicator, active/error count, avg throughput
- **Connector Table**: Name, Type, Status, Endpoint, Error Rate, Last Sync, Actions
- **Status Indicators**: Color-coded (green=healthy, yellow=degraded, red=error, gray=disabled)
- **Connector Config**: Name, type, description, enable/disable toggle
- **Endpoint Config**: Base URL, timeout, retry settings
- **Auth Settings**: Auth type dropdown, credentials (API key, OAuth client ID/secret, username/password)
- **Test Connection**: Button to validate connectivity and auth
- **Error Rate**: Chart showing error percentage over time
- **Throughput Metrics**: Messages sent/received per hour
- **Enable/Disable**: Toggle connector active state
- **Logs**: Recent connection attempts with success/failure

## Admin-Specific
- **Connector Registry**: Central management of all integrations
- **Health Monitoring**: Real-time status tracking
- **Test Before Activate**: Validate configuration before enabling
