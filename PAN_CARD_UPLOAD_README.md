# PAN Card Upload & OCR Feature

This document describes the PAN card upload and OCR (Optical Character Recognition) functionality implemented in the PAN Verification System.

## 🚀 Features

### 📸 Image Upload
- **Drag & Drop Support**: Users can drag and drop PAN card images
- **Click to Upload**: Traditional file picker interface
- **File Validation**: Validates file type and size
- **Image Preview**: Shows uploaded image before processing
- **Multiple Formats**: Supports PNG, JPG, JPEG formats

### 🔍 OCR Processing
- **Automatic Data Extraction**: Extracts PAN number, name, and date of birth
- **Form Auto-fill**: Automatically populates verification form
- **Data Validation**: Validates extracted data format
- **Confidence Scoring**: Provides confidence levels for extracted data
- **Error Handling**: Graceful error handling for failed extractions

### 🎨 User Experience
- **Upload Tips**: Interactive tips for better image quality
- **Loading States**: Visual feedback during processing
- **Success Indicators**: Clear success messages with extracted data
- **Error Messages**: User-friendly error notifications
- **Responsive Design**: Works on desktop and mobile devices

## 📁 File Structure

```
src/
├── components/
│   ├── PanCardUpload.tsx          # Main upload component
│   └── UploadTips.tsx             # Upload tips component
├── app/
│   ├── api/
│   │   └── ocr/
│   │       └── extract-pan/
│   │           └── route.ts       # OCR API endpoint
│   └── page.js                    # Main page with upload integration
```

## 🔧 Components

### 1. PanCardUpload Component (`src/components/PanCardUpload.tsx`)

**Features:**
- File upload with drag & drop
- Image preview
- OCR processing integration
- Data extraction and form population
- Error handling

**Props:**
```typescript
interface PanCardUploadProps {
  onDataExtracted: (data: PanCardData) => void;
  onError: (message: string) => void;
}
```

**Usage:**
```tsx
<PanCardUpload
  onDataExtracted={(data) => {
    setPan(data.panNumber);
    setName(data.name);
    setDob(data.dateOfBirth);
  }}
  onError={(message) => setError(message)}
/>
```

### 2. UploadTips Component (`src/components/UploadTips.tsx`)

**Features:**
- Collapsible tips section
- Best practices for image upload
- Do's and Don'ts guide
- Responsive design

### 3. OCR API Endpoint (`src/app/api/ocr/extract-pan/route.ts`)

**Features:**
- File validation (type and size)
- Mock OCR processing (simulated)
- Data validation and formatting
- Error handling

**Request:**
```typescript
POST /api/ocr/extract-pan
Content-Type: multipart/form-data

FormData:
- image: File (PAN card image)
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    panNumber: string;
    name: string;
    dateOfBirth: string;
    confidence: number;
  };
  message: string;
}
```

## 🔄 Workflow

### 1. Image Upload Process
1. User clicks "Upload PAN Card" button
2. Upload interface appears with tips
3. User selects or drags image file
4. File validation (type, size)
5. Image preview displayed
6. OCR processing initiated

### 2. OCR Processing
1. Image sent to `/api/ocr/extract-pan`
2. File validation on server
3. OCR processing (simulated)
4. Data extraction and validation
5. Response with extracted data
6. Form auto-population

### 3. Data Validation
- **PAN Number**: Validates format (5 letters + 4 digits + 1 letter)
- **Date of Birth**: Validates format and reasonable date range
- **Name**: Extracts and formats name from OCR text

## 🛠️ Implementation Details

### File Validation
```typescript
// File type validation
if (!file.type.startsWith('image/')) {
  throw new Error('Please select a valid image file');
}

// File size validation (5MB limit)
if (file.size > 5 * 1024 * 1024) {
  throw new Error('File size should be less than 5MB');
}
```

### PAN Number Validation
```typescript
function validatePANFormat(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}
```

### Date Validation
```typescript
function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const dateObj = new Date(date);
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return false;
  
  // Check if date is not in the future
  if (dateObj > new Date()) return false;
  
  // Check if date is reasonable (not too old)
  if (dateObj.getFullYear() < 1900) return false;
  
  return true;
}
```

## 🎯 Mock Data

For demonstration purposes, the OCR API returns mock data:

```typescript
const mockResults = [
  {
    panNumber: 'ABCDE1234F',
    name: 'JOHN RONALD DOE',
    dateOfBirth: '1990-05-15',
    confidence: 0.95
  },
  {
    panNumber: 'XYZAB5678G',
    name: 'JANE SMITH',
    dateOfBirth: '1985-12-20',
    confidence: 0.92
  },
  // ... more mock data
];
```

## 🔮 Production Implementation

For production use, replace the mock OCR with real OCR services:

### Option 1: Google Vision API
```typescript
import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient();
const [result] = await client.textDetection(imageBuffer);
const text = result.fullTextAnnotation.text;
```

### Option 2: AWS Textract
```typescript
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';

const client = new TextractClient();
const command = new DetectDocumentTextCommand({
  Document: { Bytes: imageBuffer }
});
const result = await client.send(command);
```

### Option 3: Azure Computer Vision
```typescript
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';

const client = new ComputerVisionClient(credentials, endpoint);
const result = await client.recognizePrintedTextInStream(true, imageBuffer);
```

## 🎨 Styling

The components use Tailwind CSS classes for styling:

- **Upload Area**: Dashed border with hover effects
- **Preview**: Aspect ratio maintained with object-fit
- **Loading**: Spinning animation with text
- **Success**: Green background with checkmark icon
- **Error**: Red background with error message
- **Tips**: Blue background with expandable content

## 🔒 Security Considerations

### File Upload Security
- File type validation
- File size limits
- Malware scanning (recommended for production)
- Secure file storage

### OCR Security
- API key management
- Rate limiting
- Input sanitization
- Output validation

### Data Privacy
- Temporary file storage
- Secure data transmission
- Data retention policies
- GDPR compliance

## 🧪 Testing

### Unit Tests
```typescript
// Test file validation
test('should reject non-image files', () => {
  const file = new File([''], 'test.txt', { type: 'text/plain' });
  expect(validateFileType(file)).toBe(false);
});

// Test PAN validation
test('should validate correct PAN format', () => {
  expect(validatePANFormat('ABCDE1234F')).toBe(true);
  expect(validatePANFormat('INVALID')).toBe(false);
});
```

### Integration Tests
```typescript
// Test OCR API
test('should extract data from image', async () => {
  const formData = new FormData();
  formData.append('image', mockImageFile);
  
  const response = await fetch('/api/ocr/extract-pan', {
    method: 'POST',
    body: formData
  });
  
  expect(response.ok).toBe(true);
  const data = await response.json();
  expect(data.success).toBe(true);
});
```

## 🚀 Future Enhancements

- [ ] **Real OCR Integration**: Connect to actual OCR services
- [ ] **Multiple Language Support**: Support for different PAN card formats
- [ ] **Batch Processing**: Upload multiple images at once
- [ ] **Image Enhancement**: Auto-crop and enhance uploaded images
- [ ] **Confidence Thresholds**: Allow users to set confidence levels
- [ ] **Manual Correction**: Interface to correct extracted data
- [ ] **History**: Save and reuse uploaded images
- [ ] **Analytics**: Track upload success rates and common issues

## 📞 Support

For issues or questions about the PAN card upload feature:

1. Check the browser console for error messages
2. Verify image quality and format
3. Ensure file size is under 5MB
4. Try uploading a different image
5. Contact support with error details

## 📝 Notes

- The current implementation uses mock OCR data for demonstration
- Real OCR integration requires API keys and service setup
- Image processing may take 2-3 seconds (simulated)
- Extracted data should always be verified by users
- The feature works best with clear, well-lit images 