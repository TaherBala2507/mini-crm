# Organization Settings API Documentation

## Overview
The Organization Settings API allows administrators to view and manage organization-level configurations, including business settings, custom lead statuses/sources, required fields, and feature flags.

## Endpoints

### 1. Get Organization Profile
**GET** `/api/org`

Retrieves the current organization's profile with statistics.

**Authentication:** Required  
**Permission:** `org.view`

**Response:**
```json
{
  "success": true,
  "message": "Organization retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Acme Corp",
    "domain": "acme",
    "status": "active",
    "settings": {
      "timezone": "UTC",
      "currency": "USD",
      "dateFormat": "MM/DD/YYYY",
      "timeFormat": "12h",
      "customLeadStatuses": ["new", "qualified", "proposal", "won", "lost"],
      "customLeadSources": ["website", "referral", "cold-call", "linkedin"],
      "requiredFields": {
        "lead": {
          "company": true,
          "phone": false,
          "source": true
        },
        "project": {
          "client": false,
          "description": true
        }
      },
      "features": {
        "enableEmailNotifications": true,
        "enableTaskReminders": true,
        "enableAuditLog": true
      }
    },
    "stats": {
      "users": 25,
      "leads": 150,
      "projects": 42,
      "tasks": 318
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Update Organization Settings
**PATCH** `/api/org`

Updates organization settings. Only SuperAdmin and Admin roles have access.

**Authentication:** Required  
**Permission:** `org.manage`

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "domain": "acme-corp",
  "settings": {
    "timezone": "America/New_York",
    "currency": "USD",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "customLeadStatuses": ["new", "qualified", "proposal", "negotiation", "won", "lost"],
    "customLeadSources": ["website", "referral", "cold-call", "linkedin", "trade-show"],
    "requiredFields": {
      "lead": {
        "company": true,
        "phone": true,
        "source": true
      },
      "project": {
        "client": true,
        "description": true
      }
    },
    "features": {
      "enableEmailNotifications": true,
      "enableTaskReminders": true,
      "enableAuditLog": true
    }
  }
}
```

**Validation Rules:**
- `name`: 2-100 characters (optional)
- `domain`: 2-100 characters, lowercase (optional)
- `settings.timezone`: Valid timezone string (optional)
- `settings.currency`: 3-character ISO 4217 code (optional)
- `settings.dateFormat`: One of `MM/DD/YYYY`, `DD/MM/YYYY`, `YYYY-MM-DD` (optional)
- `settings.timeFormat`: One of `12h`, `24h` (optional)
- `settings.customLeadStatuses`: Array of strings, 1-50 chars each (optional)
- `settings.customLeadSources`: Array of strings, 1-50 chars each (optional)
- At least one field must be provided

**Response:**
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Acme Corporation",
    "domain": "acme-corp",
    "status": "active",
    "settings": {
      "timezone": "America/New_York",
      "currency": "USD",
      "dateFormat": "MM/DD/YYYY",
      "timeFormat": "12h",
      "customLeadStatuses": ["new", "qualified", "proposal", "negotiation", "won", "lost"],
      "customLeadSources": ["website", "referral", "cold-call", "linkedin", "trade-show"],
      "requiredFields": {
        "lead": {
          "company": true,
          "phone": true,
          "source": true
        },
        "project": {
          "client": true,
          "description": true
        }
      },
      "features": {
        "enableEmailNotifications": true,
        "enableTaskReminders": true,
        "enableAuditLog": true
      }
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

## Settings Configuration

### Business Settings
- **timezone**: Organization's default timezone (e.g., "UTC", "America/New_York")
- **currency**: ISO 4217 currency code (e.g., "USD", "EUR", "GBP")
- **dateFormat**: Date display format across the application
- **timeFormat**: 12-hour or 24-hour time format

### Lead Settings
- **customLeadStatuses**: Custom status values for leads (extends default statuses)
- **customLeadSources**: Custom source values for lead tracking

### Required Fields
Configure which fields are mandatory when creating/updating entities:
- **lead.company**: Make company field required for leads
- **lead.phone**: Make phone field required for leads
- **lead.source**: Make source field required for leads
- **project.client**: Make client field required for projects
- **project.description**: Make description field required for projects

### Feature Flags
Enable/disable organization-wide features:
- **enableEmailNotifications**: Send email notifications for events
- **enableTaskReminders**: Send reminders for upcoming task due dates
- **enableAuditLog**: Enable detailed audit logging for all actions

---

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Organization not found",
  "errorCode": "NOT_FOUND"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Domain already in use by another organization",
  "errorCode": "CONFLICT"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "errorCode": "FORBIDDEN"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "settings.currency",
      "message": "String must contain exactly 3 character(s)"
    }
  ]
}
```

---

## Audit Logging

All organization updates are logged to the audit log with:
- **action**: `UPDATE`
- **entityType**: `organization`
- **before**: Previous organization state
- **after**: Updated organization state
- **actorUserId**: User who made the change
- **ip**: Request IP address
- **userAgent**: Request user agent

---

## Use Cases

### 1. Customize Lead Pipeline
Update custom lead statuses to match your sales process:
```json
{
  "settings": {
    "customLeadStatuses": [
      "new",
      "contacted",
      "qualified",
      "demo-scheduled",
      "proposal-sent",
      "negotiation",
      "won",
      "lost"
    ]
  }
}
```

### 2. Configure Regional Settings
Set timezone and currency for international operations:
```json
{
  "settings": {
    "timezone": "Europe/London",
    "currency": "GBP",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h"
  }
}
```

### 3. Enforce Data Quality
Make critical fields required:
```json
{
  "settings": {
    "requiredFields": {
      "lead": {
        "company": true,
        "phone": true,
        "source": true
      }
    }
  }
}
```

### 4. Manage Feature Access
Control feature availability:
```json
{
  "settings": {
    "features": {
      "enableEmailNotifications": false,
      "enableTaskReminders": true,
      "enableAuditLog": true
    }
  }
}
```

---

## Implementation Notes

1. **Settings Merge**: Updates are merged with existing settings (not replaced)
2. **Deep Merge**: Nested objects like `requiredFields` are deep-merged
3. **Domain Uniqueness**: Domain must be unique across all organizations
4. **Transaction Safety**: All updates use MongoDB transactions
5. **Audit Trail**: Complete before/after state captured in audit log
6. **Statistics**: Organization stats are calculated in real-time
7. **Default Values**: New organizations get sensible default settings

---

## Testing Examples

### Get Organization (cURL)
```bash
curl -X GET http://localhost:5000/api/org \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Organization (cURL)
```bash
curl -X PATCH http://localhost:5000/api/org \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "timezone": "America/New_York",
      "customLeadStatuses": ["new", "qualified", "won", "lost"]
    }
  }'
```

---

## Security Considerations

1. **Permission-Based Access**: Only users with `org.manage` permission can update settings
2. **View Access**: All authenticated users with `org.view` can view organization details
3. **Domain Validation**: Domain changes are validated for uniqueness
4. **Audit Logging**: All changes are logged with actor information
5. **Multi-Tenant Isolation**: Users can only access their own organization

---

## Future Enhancements

- [ ] Organization logo upload
- [ ] Custom field definitions
- [ ] Email template customization
- [ ] Webhook configuration
- [ ] API rate limit customization
- [ ] SSO/SAML configuration
- [ ] Branding customization (colors, fonts)
- [ ] Custom notification preferences