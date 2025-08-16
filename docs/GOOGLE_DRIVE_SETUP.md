# Google Drive Integration Setup

This guide will help you set up Google Drive integration for the University Management System.

## Prerequisites

1. Google Cloud Platform account
2. Google Drive API enabled
3. Service Account credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `university-drive-service`
   - Description: `Service account for university file management`
4. Click "Create and Continue"
5. Skip role assignment for now (click "Continue")
6. Click "Done"

## Step 3: Generate Service Account Key

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Download the JSON file
6. Rename it to `google-service-account.json`
7. Place it in your project root directory

## Step 4: Create University Folder in Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder named "University Documents"
3. Right-click the folder > "Share"
4. Add your service account email (found in the JSON file) with "Editor" permissions
5. Copy the folder ID from the URL (the long string after `/folders/`)

## Step 5: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Google Drive Configuration
GOOGLE_DRIVE_SERVICE_ACCOUNT_PATH=./google-service-account.json
GOOGLE_DRIVE_UNIVERSITY_FOLDER_ID=your_folder_id_here
```

## Step 6: Test the Integration

Start your server and test the endpoints:

```bash
# Upload a file
curl -X POST http://localhost:3000/api/drive/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "name=Test Document" \
  -F "description=Test upload"

# List files
curl -X GET http://localhost:3000/api/drive/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## API Endpoints

### File Operations
- `POST /api/drive/upload` - Upload file to Google Drive
- `GET /api/drive/files` - List all files with pagination
- `GET /api/drive/files/:fileId` - Get specific file details
- `GET /api/drive/files/:fileId/download` - Download file
- `PUT /api/drive/files/:fileId` - Update file metadata
- `DELETE /api/drive/files/:fileId` - Delete file

### Folder Operations
- `POST /api/drive/folders` - Create new folder
- `GET /api/drive/search?q=searchterm` - Search files

### Sharing Operations
- `POST /api/drive/files/:fileId/share` - Share file with user
- `GET /api/drive/files/:fileId/permissions` - Get file permissions

## Security Notes

1. **Never commit** the service account JSON file to version control
2. Add `google-service-account.json` to your `.gitignore`
3. Use environment variables for sensitive configuration
4. Regularly rotate service account keys
5. Monitor API usage in Google Cloud Console

## File Upload Limits

- Maximum file size: 50MB
- Supported file types:
  - Documents: PDF, DOC, DOCX, TXT
  - Spreadsheets: XLS, XLSX
  - Presentations: PPT, PPTX
  - Images: JPEG, PNG, GIF
  - Videos: MP4, AVI
  - Audio: MP3, WAV

## Troubleshooting

### Common Issues

1. **"Invalid credentials"**
   - Check service account JSON file path
   - Verify service account has access to the folder

2. **"Folder not found"**
   - Verify the folder ID in environment variables
   - Ensure service account has access to the folder

3. **"Quota exceeded"**
   - Check Google Drive API quotas in Cloud Console
   - Implement request throttling if needed

### Error Codes

- `400` - Bad request (missing file, invalid parameters)
- `401` - Unauthorized (invalid JWT token)
- `403` - Forbidden (insufficient permissions)
- `404` - File not found
- `413` - File too large
- `500` - Server error (Google Drive API issues)

## Best Practices

1. **File Organization**: Use consistent folder structure
2. **Naming Convention**: Use descriptive file names
3. **Metadata**: Always include department, course, and subject
4. **Permissions**: Use appropriate sharing settings
5. **Monitoring**: Track file usage and downloads
6. **Backup**: Regularly backup important files