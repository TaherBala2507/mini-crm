# File Attachment API - Quick Reference

## 🚀 Quick Start

### Upload a File
```bash
curl -X POST http://localhost:5000/api/attachments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "entityType=lead" \
  -F "entityId=507f1f77bcf86cd799439011" \
  -F "description=Contract proposal"
```

### Upload Multiple Files
```bash
curl -X POST http://localhost:5000/api/attachments/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.jpg" \
  -F "entityType=project" \
  -F "entityId=507f1f77bcf86cd799439011"
```

### List Attachments
```bash
curl -X GET "http://localhost:5000/api/attachments?entityType=lead&entityId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Download a File
```bash
curl -X GET http://localhost:5000/api/attachments/507f1f77bcf86cd799439011/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded-file.pdf
```

### Get Statistics
```bash
curl -X GET http://localhost:5000/api/attachments/stats/project/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Attachment
```bash
curl -X DELETE http://localhost:5000/api/attachments/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Endpoints Summary

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/attachments` | FILE_UPLOAD | Upload single file |
| POST | `/api/attachments/bulk` | FILE_UPLOAD | Upload up to 5 files |
| GET | `/api/attachments` | FILE_VIEW | List with filters |
| GET | `/api/attachments/stats/:entityType/:entityId` | FILE_VIEW | Get statistics |
| GET | `/api/attachments/:id` | FILE_VIEW | Get details |
| GET | `/api/attachments/:id/download` | FILE_DOWNLOAD | Download file |
| DELETE | `/api/attachments/:id` | FILE_DELETE | Delete file |

---

## 🔑 Permissions

| Permission | SuperAdmin | Admin | Manager | Agent | Auditor |
|------------|------------|-------|---------|-------|---------|
| FILE_UPLOAD | ✅ | ✅ | ✅ | ✅ | ❌ |
| FILE_VIEW | ✅ | ✅ | ✅ | ✅ | ✅ |
| FILE_DOWNLOAD | ✅ | ✅ | ✅ | ✅ | ✅ |
| FILE_DELETE | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 📁 Allowed File Types

### Images
`.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`

### Documents
`.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.txt`, `.csv`, `.rtf`, `.odt`, `.ods`, `.odp`

### Archives
`.zip`, `.rar`, `.7z`, `.tar`, `.gz`

### Other
`.json`, `.xml`

---

## ⚙️ Limits

- **Max file size:** 10MB per file
- **Max files per request:** 5 (bulk upload only)
- **Filename length:** 255 characters max

---

## 🔍 Query Parameters (List Endpoint)

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `?limit=20` |
| `entityType` | string | Filter by entity type | `?entityType=lead` |
| `entityId` | string | Filter by entity ID | `?entityId=507f...` |
| `uploadedBy` | string | Filter by uploader | `?uploadedBy=507f...` |
| `search` | string | Search in filename/description | `?search=proposal` |

---

## 📊 Response Examples

### Upload Success
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "filename": "document.pdf",
    "originalName": "Client Proposal.pdf",
    "mimeType": "application/pdf",
    "size": 2048576,
    "entityType": "lead",
    "entityId": "507f1f77bcf86cd799439013",
    "description": "Contract proposal",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### List Response
```json
{
  "success": true,
  "data": {
    "attachments": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "filename": "document.pdf",
        "size": 2048576,
        "uploadedBy": {
          "name": "John Doe",
          "email": "john@example.com"
        },
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

### Statistics Response
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
      }
    ]
  }
}
```

---

## ❌ Common Errors

### 400 - No File Uploaded
```json
{
  "success": false,
  "error": {
    "message": "No file uploaded"
  }
}
```

### 400 - Invalid File Type
```json
{
  "success": false,
  "error": {
    "message": "Invalid file type. Only images, documents, and archives are allowed"
  }
}
```

### 400 - File Too Large
```json
{
  "success": false,
  "error": {
    "message": "File too large. Maximum size is 10MB"
  }
}
```

### 403 - Missing Permission
```json
{
  "success": false,
  "error": {
    "message": "You do not have permission to perform this action. Required: FILE_UPLOAD"
  }
}
```

### 404 - Entity Not Found
```json
{
  "success": false,
  "error": {
    "message": "Lead not found"
  }
}
```

---

## 💡 Tips & Best Practices

### Client-Side
1. **Check file size before upload** - Validate on client to save bandwidth
2. **Show upload progress** - Use progress events for better UX
3. **Handle errors gracefully** - Display user-friendly messages
4. **Use bulk upload** - More efficient for multiple files

### Server-Side
1. **Entity verification** - API automatically verifies entity access
2. **Transaction safety** - Failed uploads are automatically rolled back
3. **File cleanup** - Physical files are deleted on transaction failure
4. **Audit logging** - All operations are logged automatically

### Security
1. **File type validation** - Only whitelisted types are accepted
2. **Filename sanitization** - Path traversal is prevented
3. **Size limits** - Enforced on server side
4. **Permission checks** - RBAC applied to all endpoints

---

## 🔧 Integration Examples

### JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('entityType', 'lead');
formData.append('entityId', leadId);
formData.append('description', 'Contract proposal');

const response = await fetch('http://localhost:5000/api/attachments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

### Axios
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('entityType', 'project');
formData.append('entityId', projectId);

const response = await axios.post(
  'http://localhost:5000/api/attachments',
  formData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload: ${percentCompleted}%`);
    }
  }
);
```

### React Hook
```javascript
const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file, entityType, entityId, description) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    if (description) formData.append('description', description);

    try {
      const response = await axios.post('/api/attachments', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      return response.data;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, progress };
};
```

---

## 🐛 Troubleshooting

### Upload Fails with 413 Payload Too Large
- Check file size (max 10MB)
- Verify nginx/proxy settings if behind reverse proxy

### Upload Fails with 400 Invalid File Type
- Check file extension against allowed types
- Ensure MIME type is correct

### Download Returns 404
- Verify attachment ID is correct
- Check if file exists on disk
- Ensure user has FILE_DOWNLOAD permission

### Cannot Delete Attachment
- Verify user has FILE_DELETE permission
- Check if attachment belongs to user's organization

---

## 📞 Support

For detailed documentation, see `/docs/FILE_ATTACHMENT_API.md`

For issues or questions, contact the development team.

---

**API Version:** 1.0.0  
**Last Updated:** January 2024