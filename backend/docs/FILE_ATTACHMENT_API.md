# File Upload/Attachment API Documentation

## Overview

The File Upload/Attachment API provides comprehensive file management capabilities for the Mini-CRM system. It allows users to upload, manage, and download files attached to various entities (Leads, Projects, Tasks) with robust security, validation, and audit logging.

## Table of Contents

- [Features](#features)
- [Permissions](#permissions)
- [File Restrictions](#file-restrictions)
- [API Endpoints](#api-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Features

### Core Capabilities
- ✅ **Single & Bulk Upload**: Upload one file or up to 5 files in a single request
- ✅ **Entity Linking**: Attach files to Leads, Projects, or Tasks
- ✅ **File Type Validation**: Whitelist-based file type filtering
- ✅ **Size Limits**: 10MB maximum per file
- ✅ **Secure Storage**: Sanitized filenames prevent path traversal attacks
- ✅ **Entity Verification**: Validates entity exists and belongs to organization
- ✅ **Statistics**: Aggregate file count, total size, and file types per entity
- ✅ **Streaming Downloads**: Efficient file delivery with proper headers
- ✅ **Transaction Safety**: Automatic rollback on failures
- ✅ **Audit Logging**: Complete before/after state tracking
- ✅ **RBAC Protection**: Fine-grained permission checks

### Security Features
- Multi-tenant isolation (all operations scoped to organization)
- Filename sanitization (removes special characters, prevents path traversal)
- File type whitelist (only allowed extensions accepted)
- Entity access verification (ensures user has access to linked entity)
- Permission-based access control (upload, view, download, delete)

---

## Permissions

The following permissions control access to file operations:

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `FILE_UPLOAD` | Upload files and attach to entities | SuperAdmin, Admin, Manager, Agent |
| `FILE_VIEW` | View file metadata and list attachments | SuperAdmin, Admin, Manager, Agent, Auditor |
| `FILE_DOWNLOAD` | Download file contents | SuperAdmin, Admin, Manager, Agent, Auditor |
| `FILE_DELETE` | Delete files and attachments | SuperAdmin, Admin |

**Note:** All file operations require authentication. Users can only access files within their organization.

---

## File Restrictions

### Allowed File Types

The system accepts the following file types:

**Images:**
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`

**Documents:**
- `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.txt`, `.csv`, `.rtf`, `.odt`, `.ods`, `.odp`

**Archives:**
- `.zip`, `.rar`, `.7z`, `.tar`, `.gz`

**Other:**
- `.json`, `.xml`

### Size Limits

- **Maximum file size:** 10MB per file
- **Maximum files per request:** 5 files (bulk upload only)

### Filename Rules

- Special characters are removed or replaced with underscores
- Spaces are replaced with underscores
- Path traversal sequences (`../`, `..\\`) are removed
- Maximum filename length: 255 characters

---

## API Endpoints

### 1. Upload Single File

Upload a single file and attach it to an entity.

**Endpoint:** `POST /api/attachments`

**Permission Required:** `FILE_UPLOAD`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` (required): The file to upload
- `entityType` (required): Type of entity (`lead`, `project`, or `task`)
- `entityId` (required): MongoDB ObjectId of the entity
- `description` (optional): Description of the file (max 500 characters)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orgId": "507f1f77bcf86cd799439012",
    "entityType": "lead",
    "entityId": "507f1f77bcf86cd799439013",
    "filename": "proposal.pdf",
    "originalName": "Client Proposal.pdf",
    "mimeType": "application/pdf",
    "size": 2048576,
    "path": "uploads/1699564800000-abc123-client-proposal.pdf",
    "uploadedBy": "507f1f77bcf86cd799439014",
    "description": "Q4 2024 proposal for client",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Upload Multiple Files

Upload up to 5 files in a single request.

**Endpoint:** `POST /api/attachments/bulk`

**Permission Required:** `FILE_UPLOAD`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `files` (required): Array of files (max 5)
- `entityType` (required): Type of entity (`lead`, `project`, or `task`)
- `entityId` (required): MongoDB ObjectId of the entity
- `description` (optional): Description applied to all files

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "uploaded": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "filename": "document1.pdf",
        "originalName": "Document 1.pdf",
        "size": 1024000
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "filename": "document2.pdf",
        "originalName": "Document 2.pdf",
        "size": 2048000
      }
    ],
    "count": 2,
    "totalSize": 3072000
  }
}
```

---

### 3. List Attachments

Retrieve a paginated list of attachments with optional filters.

**Endpoint:** `GET /api/attachments`

**Permission Required:** `FILE_VIEW`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `entityType` (optional): Filter by entity type (`lead`, `project`, `task`)
- `entityId` (optional): Filter by entity ID
- `uploadedBy` (optional): Filter by uploader user ID
- `search` (optional): Search in filename, originalName, or description

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "attachments": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "entityType": "lead",
        "entityId": "507f1f77bcf86cd799439013",
        "filename": "proposal.pdf",
        "originalName": "Client Proposal.pdf",
        "mimeType": "application/pdf",
        "size": 2048576,
        "uploadedBy": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "description": "Q4 2024 proposal",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

---

### 4. Get Attachment Details

Retrieve detailed information about a specific attachment.

**Endpoint:** `GET /api/attachments/:id`

**Permission Required:** `FILE_VIEW`

**Path Parameters:**
- `id`: Attachment ID (MongoDB ObjectId)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orgId": "507f1f77bcf86cd799439012",
    "entityType": "lead",
    "entityId": "507f1f77bcf86cd799439013",
    "filename": "proposal.pdf",
    "originalName": "Client Proposal.pdf",
    "mimeType": "application/pdf",
    "size": 2048576,
    "path": "uploads/1699564800000-abc123-client-proposal.pdf",
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "description": "Q4 2024 proposal for client",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 5. Download Attachment

Download the file contents with proper headers.

**Endpoint:** `GET /api/attachments/:id/download`

**Permission Required:** `FILE_DOWNLOAD`

**Path Parameters:**
- `id`: Attachment ID (MongoDB ObjectId)

**Response:** `200 OK`
- **Content-Type:** Original file MIME type
- **Content-Disposition:** `attachment; filename="original-filename.ext"`
- **Body:** File binary data (streamed)

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/attachments/507f1f77bcf86cd799439011/download \
  -o downloaded-file.pdf
```

---

### 6. Get Entity Statistics

Get aggregated statistics for all attachments linked to an entity.

**Endpoint:** `GET /api/attachments/stats/:entityType/:entityId`

**Permission Required:** `FILE_VIEW`

**Path Parameters:**
- `entityType`: Type of entity (`lead`, `project`, or `task`)
- `entityId`: Entity ID (MongoDB ObjectId)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalFiles": 12,
    "totalSize": 25165824,
    "totalSizeFormatted": "24.00 MB",
    "fileTypes": [
      {
        "mimeType": "application/pdf",
        "count": 8,
        "totalSize": 16777216
      },
      {
        "mimeType": "image/jpeg",
        "count": 3,
        "totalSize": 6291456
      },
      {
        "mimeType": "application/vnd.ms-excel",
        "count": 1,
        "totalSize": 2097152
      }
    ]
  }
}
```

---

### 7. Delete Attachment

Delete an attachment and its associated file from storage.

**Endpoint:** `DELETE /api/attachments/:id`

**Permission Required:** `FILE_DELETE`

**Path Parameters:**
- `id`: Attachment ID (MongoDB ObjectId)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

**Note:** This operation:
- Deletes the database record
- Removes the physical file from storage
- Creates an audit log entry
- Cannot be undone

---

## Request/Response Examples

### Example 1: Upload a PDF Document

**Request:**
```bash
curl -X POST http://localhost:5000/api/attachments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "entityType=lead" \
  -F "entityId=507f1f77bcf86cd799439013" \
  -F "description=Contract proposal for review"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "filename": "document.pdf",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "description": "Contract proposal for review",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Example 2: Upload Multiple Images

**Request:**
```bash
curl -X POST http://localhost:5000/api/attachments/bulk \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg" \
  -F "files=@/path/to/image3.png" \
  -F "entityType=project" \
  -F "entityId=507f1f77bcf86cd799439020" \
  -F "description=Project screenshots"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploaded": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "filename": "image1.jpg",
        "originalName": "image1.jpg",
        "size": 512000
      },
      {
        "_id": "507f1f77bcf86cd799439022",
        "filename": "image2.jpg",
        "originalName": "image2.jpg",
        "size": 768000
      },
      {
        "_id": "507f1f77bcf86cd799439023",
        "filename": "image3.png",
        "originalName": "image3.png",
        "size": 1024000
      }
    ],
    "count": 3,
    "totalSize": 2304000
  }
}
```

---

### Example 3: List Attachments for a Lead

**Request:**
```bash
curl -X GET "http://localhost:5000/api/attachments?entityType=lead&entityId=507f1f77bcf86cd799439013&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attachments": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "filename": "proposal.pdf",
        "originalName": "Client Proposal.pdf",
        "size": 2048576,
        "uploadedBy": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### Example 4: Search Attachments

**Request:**
```bash
curl -X GET "http://localhost:5000/api/attachments?search=proposal&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Example 5: Get Statistics for a Project

**Request:**
```bash
curl -X GET "http://localhost:5000/api/attachments/stats/project/507f1f77bcf86cd799439020" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 5,
    "totalSize": 10485760,
    "totalSizeFormatted": "10.00 MB",
    "fileTypes": [
      {
        "mimeType": "application/pdf",
        "count": 3,
        "totalSize": 6291456
      },
      {
        "mimeType": "image/jpeg",
        "count": 2,
        "totalSize": 4194304
      }
    ]
  }
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request - Invalid Input
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": [
      {
        "field": "entityType",
        "message": "entityType must be one of: lead, project, task"
      }
    ]
  }
}
```

#### 400 Bad Request - No File Uploaded
```json
{
  "success": false,
  "error": {
    "message": "No file uploaded"
  }
}
```

#### 400 Bad Request - Invalid File Type
```json
{
  "success": false,
  "error": {
    "message": "Invalid file type. Only images, documents, and archives are allowed"
  }
}
```

#### 400 Bad Request - File Too Large
```json
{
  "success": false,
  "error": {
    "message": "File too large. Maximum size is 10MB"
  }
}
```

#### 400 Bad Request - Too Many Files
```json
{
  "success": false,
  "error": {
    "message": "Too many files. Maximum 5 files allowed per request"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Authentication required"
  }
}
```

#### 403 Forbidden - Missing Permission
```json
{
  "success": false,
  "error": {
    "message": "You do not have permission to perform this action. Required: FILE_UPLOAD"
  }
}
```

#### 404 Not Found - Entity Not Found
```json
{
  "success": false,
  "error": {
    "message": "Lead not found"
  }
}
```

#### 404 Not Found - Attachment Not Found
```json
{
  "success": false,
  "error": {
    "message": "Attachment not found"
  }
}
```

#### 404 Not Found - File Not Found
```json
{
  "success": false,
  "error": {
    "message": "File not found on disk"
  }
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Failed to upload file"
  }
}
```

---

## Best Practices

### For Developers

1. **Always Validate Entity Access**
   - The API automatically verifies that the entity exists and belongs to the user's organization
   - No need to manually check entity ownership before uploading

2. **Use Bulk Upload for Multiple Files**
   - More efficient than multiple single uploads
   - Reduces network overhead and API calls

3. **Handle File Size Gracefully**
   - Check file size on the client before uploading
   - Display user-friendly error messages for oversized files

4. **Implement Progress Indicators**
   - File uploads can take time, especially for large files
   - Show upload progress to improve user experience

5. **Clean Up Failed Uploads**
   - The API automatically rolls back failed uploads
   - No orphaned files or database records will be created

6. **Use Statistics Endpoint**
   - Display file counts and sizes in entity detail views
   - Show file type distribution for better UX

7. **Stream Downloads**
   - The API uses streaming for efficient file delivery
   - No need to load entire file into memory

### For Security

1. **Never Trust Client-Side Validation**
   - Always rely on server-side validation
   - File type and size checks are enforced on the backend

2. **Sanitize Filenames**
   - The API automatically sanitizes filenames
   - Path traversal attacks are prevented

3. **Verify Permissions**
   - All endpoints require appropriate permissions
   - Users can only access files within their organization

4. **Audit All Operations**
   - All file operations are logged in the audit trail
   - Track who uploaded, downloaded, or deleted files

### For Performance

1. **Implement Pagination**
   - Always use pagination when listing attachments
   - Default limit is 10, maximum is 100

2. **Use Filters**
   - Filter by entity type and ID to reduce result sets
   - Use search for specific files

3. **Cache File Metadata**
   - Cache attachment lists on the client
   - Invalidate cache on upload or delete

4. **Consider CDN for Production**
   - Current implementation uses local storage
   - For production, consider cloud storage (S3, Azure Blob, GCS)

### For Maintenance

1. **Monitor Storage Usage**
   - Track total file storage per organization
   - Implement storage quotas if needed

2. **Implement Cleanup Jobs**
   - Periodically check for orphaned files
   - Remove files without database records

3. **Backup Files Regularly**
   - Include uploads directory in backup strategy
   - Test file restoration procedures

4. **Consider File Versioning**
   - Current implementation doesn't support versioning
   - Implement if needed for compliance

---

## Future Enhancements

The following features are planned for future releases:

1. **Cloud Storage Integration**
   - Support for AWS S3, Azure Blob Storage, Google Cloud Storage
   - Configurable storage backend

2. **Virus Scanning**
   - Integrate antivirus scanning before file storage
   - Quarantine suspicious files

3. **Thumbnail Generation**
   - Automatic thumbnail generation for images
   - Preview support for documents

4. **Download Tracking**
   - Track file downloads in audit logs
   - Analytics on file access patterns

5. **File Versioning**
   - Keep multiple versions of the same file
   - Version history and rollback

6. **Advanced Search**
   - Full-text search in document contents
   - OCR for scanned documents

7. **Sharing & Permissions**
   - Share files with external users
   - Time-limited download links

8. **Storage Quotas**
   - Per-organization storage limits
   - Usage reporting and alerts

---

## Support

For issues, questions, or feature requests related to the File Upload/Attachment API, please contact the development team or create an issue in the project repository.

**API Version:** 1.0.0  
**Last Updated:** January 2024