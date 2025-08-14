import Tesseract from 'tesseract.js';

export interface ExtractedPanData {
  panNumber: string;
  name: string;
  dateOfBirth: string;
  confidence: number;
}

export class TesseractOCR {
  private static instance: TesseractOCR;
  private worker: any = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): TesseractOCR {
    if (!TesseractOCR.instance) {
      TesseractOCR.instance = new TesseractOCR();
    }
    return TesseractOCR.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await Tesseract.createWorker();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Tesseract:', error);
      throw new Error('Failed to initialize OCR engine');
    }
  }

  public async extractPanData(imageFile: File): Promise<ExtractedPanData> {
    if (!this.worker || !this.isInitialized) {
      await this.initialize();
    }

    try {
      // Convert file to base64 for Tesseract
      const base64Image = await this.fileToBase64(imageFile);
      
      // Perform OCR
      const result = await this.worker.recognize(base64Image);
      
      // Extract PAN card data from OCR result
      const extractedData = this.parsePanCardData(result.data);
      
      return extractedData;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract data from image');
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private parsePanCardData(ocrResult: any): ExtractedPanData {
    const text = ocrResult.text.toUpperCase();
    const lines = ocrResult.lines?.map((line: any) => line.text.toUpperCase()) || [];
    
    console.log('OCR Raw Text:', text);
    console.log('OCR Lines:', lines);

    // Extract PAN number
    const panNumber = this.extractPANNumber(text);
    
    // Extract name
    const name = this.extractName(text, lines);
    
    // Extract date of birth
    const dateOfBirth = this.extractDateOfBirth(text, lines);
    
    // Calculate overall confidence
    const confidence = this.calculateConfidence(ocrResult);

    return {
      panNumber: panNumber || 'NOT_FOUND',
      name: name || 'NOT_FOUND',
      dateOfBirth: dateOfBirth || 'NOT_FOUND',
      confidence: confidence,
    };
  }

  private extractPANNumber(text: string): string | null {
    // PAN format: 5 letters + 4 digits + 1 letter
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
    const matches = text.match(panRegex);
    
    if (matches && matches.length > 0) {
      return matches[0];
    }

    // Alternative patterns for PAN numbers
    const alternativePatterns = [
      /PAN[:\s]*([A-Z0-9]{10})/i,
      /PERMANENT[:\s]*ACCOUNT[:\s]*NUMBER[:\s]*([A-Z0-9]{10})/i,
      /([A-Z]{5}[0-9]{4}[A-Z])/g,
    ];

    for (const pattern of alternativePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }

    return null;
  }

  private extractName(text: string, lines: string[]): string | null {
    // Common patterns for name extraction
    const namePatterns = [
      /NAME[:\s]*([A-Z\s]{3,})/i,
      /CARD[:\s]*HOLDER[:\s]*NAME[:\s]*([A-Z\s]{3,})/i,
      /HOLDER[:\s]*NAME[:\s]*([A-Z\s]{3,})/i,
    ];

    // First try to find name using patterns
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length >= 3) {
          return name;
        }
      }
    }

    // If patterns don't work, look for lines that might contain names
    // Names are usually in the middle section of PAN cards
    const potentialNameLines = lines.filter(line => {
      const cleanLine = line.replace(/[^A-Z\s]/g, '').trim();
      return cleanLine.length >= 3 && cleanLine.length <= 50 && 
             !cleanLine.includes('PAN') && 
             !cleanLine.includes('DATE') && 
             !cleanLine.includes('INCOME') &&
             !cleanLine.includes('TAX') &&
             !cleanLine.includes('DEPARTMENT');
    });

    if (potentialNameLines.length > 0) {
      // Return the longest potential name line
      return potentialNameLines.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      ).trim();
    }

    return null;
  }

  private extractDateOfBirth(text: string, lines: string[]): string | null {
    // Common date patterns
    const datePatterns = [
      /DATE[:\s]*OF[:\s]*BIRTH[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
      /DOB[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
      /BIRTH[:\s]*DATE[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
      /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/g,
      /(\d{4}[\/\-]\d{2}[\/\-]\d{2})/g,
    ];

    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const dateStr = matches[1] || matches[0];
        const formattedDate = this.formatDate(dateStr);
        if (formattedDate) {
          return formattedDate;
        }
      }
    }

    // Look for date-like patterns in lines
    for (const line of lines) {
      const dateMatch = line.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
      if (dateMatch) {
        const formattedDate = this.formatDate(dateMatch[1]);
        if (formattedDate) {
          return formattedDate;
        }
      }
    }

    return null;
  }

  private formatDate(dateStr: string): string | null {
    try {
      // Handle DD/MM/YYYY format
      if (dateStr.includes('/') || dateStr.includes('-')) {
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
          let year, month, day;
          
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            [year, month, day] = parts;
          } else {
            // DD-MM-YYYY format
            [day, month, year] = parts;
          }
          
          // Validate date
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (date.getFullYear() === parseInt(year) && 
              date.getMonth() === parseInt(month) - 1 && 
              date.getDate() === parseInt(day)) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
      }
    } catch (error) {
      console.error('Date formatting error:', error);
    }
    
    return null;
  }

  private calculateConfidence(ocrResult: any): number {
    if (!ocrResult.lines || ocrResult.lines.length === 0) {
      return 0;
    }

    const totalConfidence = ocrResult.lines.reduce((sum: number, line: any) => sum + (line.confidence || 0), 0);
    return totalConfidence / ocrResult.lines.length;
  }

  public async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Export a singleton instance
export const tesseractOCR = TesseractOCR.getInstance(); 