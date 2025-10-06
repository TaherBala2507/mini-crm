# Email Verification API Documentation

## Overview

The Email Verification API completes the user invitation workflow by allowing PENDING users to verify their email address, set their password, and activate their account. This endpoint is called after a user receives an invitation email with a verification token.

## Workflow

1. **Admin invites user** → `POST /api/users/invite`
   - User created with `PENDING` status
   - Temporary password generated
   - Email verification token created (7-day expiry)
   - Invitation email sent with verification link

2. **User clicks verification link** → Frontend redirects to verification page

3. **User sets password** → `POST /api/auth/verify-email`
   - Token validated
   - User sets their own password
   - Account status changed to `ACTIVE`
   - User automatically logged in
   - Access & refresh tokens returned

## Endpoint

### Verify Email and Activate Account

**POST** `/api/auth/verify-email`

Verifies the email verification token, sets the user's password, activates their account, and logs them in automatically.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `token`: Required, non-empty string
- `password`: Required, minimum 8 characters
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number
  - Must contain at least one special character

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully. You are now logged in.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Jane Smith",
      "email": "jane.smith@company.com",
      "orgId": "507f1f77bcf86cd799439012",
      "roles": ["Sales Rep"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

**401 Unauthorized** - Invalid or expired token:
```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

**401 Unauthorized** - User not in pending state:
```json
{
  "success": false,
  "message": "User account is not in pending state"
}
```

**404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found"
}
```

**409 Conflict** - Email already verified:
```json
{
  "success": false,
  "message": "Email already verified"
}
```

**429 Too Many Requests** - Rate limit exceeded:
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

## Security Features

### 1. Token Security
- **Hashed Storage**: Tokens are hashed with SHA-256 before storage
- **Single Use**: Tokens are revoked immediately after successful verification
- **Time-Limited**: Tokens expire after 7 days
- **Cryptographically Secure**: Generated using `crypto.randomBytes(32)`

### 2. Password Requirements
Strong password policy enforced:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*, etc.)

### 3. Rate Limiting
- Rate limiter applied to prevent brute force attacks
- Configurable limits per IP address

### 4. Transaction Safety
- All database operations wrapped in MongoDB transaction
- Automatic rollback on any error
- Ensures data consistency

### 5. Audit Logging
- User activation logged with before/after state
- IP address and user agent captured
- Timestamp recorded for compliance

## Implementation Details

### Database Changes

**User Status Transition:**
```
PENDING → ACTIVE
```

**Token Lifecycle:**
```
Created (inviteUser) → Validated (verifyEmail) → Revoked (verifyEmail)
```

### Automatic Login

After successful verification, the user is automatically logged in:
1. Access token generated (15-minute expiry)
2. Refresh token generated (7-day expiry)
3. Refresh token stored in database
4. Both tokens returned to client

### Audit Trail

The verification creates an audit log entry:
```json
{
  "orgId": "507f1f77bcf86cd799439012",
  "actorUserId": "507f1f77bcf86cd799439011",
  "action": "update",
  "entityType": "user",
  "entityId": "507f1f77bcf86cd799439011",
  "beforeJson": {
    "status": "pending"
  },
  "afterJson": {
    "status": "active"
  },
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Frontend Integration

### Example Flow

```javascript
// 1. User clicks verification link from email
// URL: https://app.example.com/verify-email?token=a1b2c3d4e5f6...

// 2. Frontend extracts token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// 3. User enters password in form
const password = 'SecurePass123!';

// 4. Frontend calls verification endpoint
const response = await fetch('http://localhost:3000/api/auth/verify-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ token, password }),
});

const result = await response.json();

if (result.success) {
  // 5. Store tokens
  localStorage.setItem('accessToken', result.data.tokens.accessToken);
  localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
  
  // 6. Redirect to dashboard
  window.location.href = '/dashboard';
} else {
  // Handle error
  console.error(result.message);
}
```

### React Example

```jsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Store tokens
        localStorage.setItem('accessToken', result.data.tokens.accessToken);
        localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Set Your Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Activate Account'}
        </button>
      </form>
    </div>
  );
}
```

## Testing

### Manual Testing with cURL

**1. First, invite a user:**
```bash
curl -X POST http://localhost:3000/api/users/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "roleNames": ["Sales Rep"]
  }'
```

**2. Copy the verification token from console output**

**3. Verify email with new password:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PASTE_TOKEN_HERE",
    "password": "SecurePass123!"
  }'
```

**4. Use returned tokens to access protected endpoints:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN_FROM_STEP_3"
```

### Test Cases

#### ✅ Success Cases

1. **Valid token and password**
   - Status: 200 OK
   - User activated
   - Tokens returned

#### ❌ Error Cases

1. **Invalid token**
   - Status: 401 Unauthorized
   - Message: "Invalid or expired verification token"

2. **Expired token (>7 days old)**
   - Status: 401 Unauthorized
   - Message: "Invalid or expired verification token"

3. **Already verified user**
   - Status: 409 Conflict
   - Message: "Email already verified"

4. **Weak password**
   - Status: 400 Bad Request
   - Message: Specific password requirement not met

5. **Missing token**
   - Status: 400 Bad Request
   - Message: "Token is required"

6. **User not found**
   - Status: 404 Not Found
   - Message: "User not found"

7. **User not in PENDING state**
   - Status: 401 Unauthorized
   - Message: "User account is not in pending state"

## Email Template Example

When sending invitation emails, include a verification link:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Welcome to CRM</title>
</head>
<body>
  <h1>You've been invited to join [Organization Name]</h1>
  
  <p>Hi [User Name],</p>
  
  <p>[Admin Name] has invited you to join [Organization Name] on our CRM platform.</p>
  
  <p>To activate your account, please click the button below and set your password:</p>
  
  <a href="https://app.example.com/verify-email?token=[VERIFICATION_TOKEN]" 
     style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
    Activate Account
  </a>
  
  <p>Or copy and paste this link into your browser:</p>
  <p>https://app.example.com/verify-email?token=[VERIFICATION_TOKEN]</p>
  
  <p><strong>This link will expire in 7 days.</strong></p>
  
  <p>If you didn't expect this invitation, you can safely ignore this email.</p>
  
  <p>Best regards,<br>The CRM Team</p>
</body>
</html>
```

## Common Issues & Solutions

### Issue: Token expired
**Solution:** Admin must re-invite the user to generate a new token.

### Issue: User already active
**Solution:** User should use the login endpoint instead.

### Issue: Password validation fails
**Solution:** Ensure password meets all requirements (8+ chars, uppercase, lowercase, number, special char).

### Issue: Token not found
**Solution:** Verify the token was copied correctly from the email. Check for extra spaces or truncation.

## Related Endpoints

- `POST /api/users/invite` - Invite new user (generates verification token)
- `POST /api/auth/login` - Login for active users
- `POST /api/auth/password/forgot` - Request password reset
- `POST /api/auth/password/reset` - Reset password with token

## Future Enhancements

1. **Email Service Integration**
   - SendGrid, AWS SES, or Mailgun integration
   - HTML email templates
   - Email delivery tracking

2. **Token Resend**
   - Endpoint to resend verification email
   - Rate limiting on resend requests

3. **Custom Expiry**
   - Configurable token expiry per organization
   - Admin setting for token lifetime

4. **Multi-Factor Authentication**
   - Optional MFA setup during verification
   - SMS or authenticator app integration

5. **Welcome Tour**
   - Redirect to onboarding flow after verification
   - Interactive product tour for new users

6. **Notification Preferences**
   - Allow users to set notification preferences during activation
   - Email, SMS, in-app notification settings

---

**Last Updated:** January 2024  
**API Version:** 1.0  
**Status:** ✅ Production Ready