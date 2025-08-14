"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import UploadTips from './UploadTips';
import Tesseract from 'tesseract.js';
import { preprocessImage } from './imagePreprocessing';

interface PanCardData {
  panNumber: string;
  name: string;
  dateOfBirth: string;
}

interface PanCardUploadProps {
  onDataExtracted: (data: PanCardData) => void;
  onError: (message: string) => void;
}

export const tesseractOCR = {
    // For compatibility with your existing frontend calls
    initialize: async () => {
      // No initialization needed for Tesseract v5.x
    },
  
    extractPanData: async (file: File): Promise<PanCardData> => {
    //   const imageUrl = URL.createObjectURL(file);
  
      const preprocessedBlob = await preprocessImage(file);

      // Convert Blob to URL
      const imageUrl = URL.createObjectURL(preprocessedBlob);
  
      const {
        data: { text },
      } = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => console.log(m),
      });
  
  
  
      console.log('OCR Raw Text:', text);
  
      const parsed = parsePanCardText(text);
      return parsed;
    },
  };
  
  function parsePanCardText(text: string): PanCardData {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  
    let panNumber = 'NOT_FOUND';
    let name = 'NOT_FOUND';
    let dateOfBirth = 'NOT_FOUND';
  
    for (const line of lines) {
      // Match PAN number (e.g., ABCDE1234F)
      if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(line)) {
        panNumber = line;
      }
  
      // Match DOB
      if (/\b\d{2}\/\d{2}\/\d{4}\b/.test(line)) {
        dateOfBirth = line.match(/\b\d{2}\/\d{2}\/\d{4}\b/)![0];
      }
  
      // Assume uppercase name if not already set and not PAN/DOB
      if (
        name === 'NOT_FOUND' &&
        /^[A-Z .]+$/.test(line) &&
        line.length > 4 &&
        !line.includes('GOVT') &&
        !/^\d/.test(line) &&
        !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(line)
      ) {
        name = line;
      }
    }
  console.log(panNumber, name, dateOfBirth);
    return { panNumber, name, dateOfBirth };
  }
  

export default function PanCardUpload({ onDataExtracted, onError }: PanCardUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<PanCardData | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    onError('');

    try {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call Tesseract OCR
      const extractedData = await extractPanDataWithTesseract(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Convert to expected format
      const data: PanCardData = {
        panNumber: extractedData.panNumber,
        name: extractedData.name,
        dateOfBirth: extractedData.dateOfBirth,
      };
      console.log(data);
      setExtractedData(data);
      onDataExtracted(data);
    } catch (error) {
      console.error('Error processing image:', error);
      onError('Failed to process the image. Please try again.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const extractPanDataWithTesseract = async (file: File): Promise<PanCardData> => {
    try {
      // Initialize Tesseract if not already done
      await tesseractOCR.initialize();
      
      // Extract data using Tesseract
      const result = await tesseractOCR.extractPanData(file);
      
      return result;
    } catch (error) {
      console.error('Tesseract OCR error:', error);
      throw new Error('OCR processing failed');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (fileInputRef.current) {
        fileInputRef.current.files = files;
        handleFileSelect({ target: { files } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const clearUpload = () => {
    setPreviewUrl(null);
    setExtractedData(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload PAN Card</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a clear image of your PAN card to auto-fill the form using AI-powered OCR
        </p>
      </div>

      <UploadTips />

      {!previewUrl ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </label>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={previewUrl}
                alt="PAN Card Preview"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={clearUpload}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isUploading && (
            <div className="text-center py-4">
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600">Processing image with AI...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{progress}% complete</p>
              </div>
            </div>
          )}

          {extractedData && !isUploading && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-800">Data extracted successfully!</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">PAN Number:</span>
                  <span className={`font-medium ${extractedData.panNumber === 'NOT_FOUND' ? 'text-red-600' : 'text-green-700'}`}>
                    {extractedData.panNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className={`font-medium ${extractedData.name === 'NOT_FOUND' ? 'text-red-600' : 'text-green-700'}`}>
                    {extractedData.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className={`font-medium ${extractedData.dateOfBirth === 'NOT_FOUND' ? 'text-red-600' : 'text-green-700'}`}>
                    {extractedData.dateOfBirth}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-700">
                  The form has been auto-filled with the extracted data. Please review and verify the information before submitting.
                  {extractedData.panNumber === 'NOT_FOUND' || extractedData.name === 'NOT_FOUND' || extractedData.dateOfBirth === 'NOT_FOUND' && (
                    <span className="block mt-1 text-red-600">
                      Some data could not be extracted. Please verify manually.
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 