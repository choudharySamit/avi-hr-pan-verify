import { NextRequest, NextResponse } from 'next/server';

interface ExtractedPanData {
  panNumber: string;
  name: string;
  dateOfBirth: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Please upload an image smaller than 5MB.' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Upload the image to a cloud storage service (AWS S3, Google Cloud Storage, etc.)
    // 2. Call an OCR service (Google Vision API, AWS Textract, Azure Computer Vision, etc.)
    // 3. Process the extracted text to identify PAN card fields
    // 4. Validate the extracted data
    // 5. Return the structured data

    // For demonstration purposes, we'll simulate OCR processing
    const extractedData = await simulateOCRExtraction(file);

    return NextResponse.json({
      success: true,
      data: extractedData,
      message: 'PAN card details extracted successfully'
    });

  } catch (error) {
    console.error('OCR extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to process the image. Please try again.' },
      { status: 500 }
    );
  }
}

async function simulateOCRExtraction(file: File): Promise<ExtractedPanData> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock OCR results - in real implementation, this would come from OCR service
  // These are example patterns that might be found on a PAN card
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
    {
      panNumber: 'PQRST9012H',
      name: 'MICHAEL BROWN',
      dateOfBirth: '1978-08-10',
      confidence: 0.88
    },
    {
      panNumber: 'LMNOP3456I',
      name: 'SARAH WILSON',
      dateOfBirth: '1992-03-25',
      confidence: 0.91
    },
    {
      panNumber: 'UVWXY7890J',
      name: 'DAVID JOHNSON',
      dateOfBirth: '1980-11-08',
      confidence: 0.89
    }
  ];

  // Randomly select one of the mock results
  const randomIndex = Math.floor(Math.random() * mockResults.length);
  const result = mockResults[randomIndex];

  // Validate the extracted data
  if (!validatePANFormat(result.panNumber)) {
    throw new Error('Invalid PAN number format detected');
  }

  if (!validateDateFormat(result.dateOfBirth)) {
    throw new Error('Invalid date format detected');
  }

  return result;
}

// Helper function to validate PAN number format
function validatePANFormat(pan: string): boolean {
  // PAN format: 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

// Helper function to validate date format
function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const dateObj = new Date(date);
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return false;
  
  // Check if date is not in the future
  if (dateObj > new Date()) return false;
  
  // Check if date is reasonable (not too old, e.g., before 1900)
  if (dateObj.getFullYear() < 1900) return false;
  
  return true;
}

// Helper function to extract PAN number from text (for real OCR implementation)
function extractPANNumber(text: string): string | null {
  const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
  const matches = text.match(panRegex);
  return matches ? matches[0] : null;
}

// Helper function to extract name from text (for real OCR implementation)
function extractName(text: string): string | null {
  // This would be more complex in real implementation
  // You'd need to identify the name field based on context
  const namePatterns = [
    /Name[:\s]+([A-Z\s]+)/i,
    /([A-Z\s]{3,})/g
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]?.trim() || null;
    }
  }
  
  return null;
}

// Helper function to extract date from text (for real OCR implementation)
function extractDate(text: string): string | null {
  const datePatterns = [
    /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/g,
    /(\d{4}[\/\-]\d{2}[\/\-]\d{2})/g,
    /Date[:\s]+(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateStr = match[1];
      // Convert to YYYY-MM-DD format
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD format
          return `${parts[0]}-${parts[1]}-${parts[2]}`;
        } else {
          // DD-MM-YYYY format
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }
  }
  
  return null;
} 