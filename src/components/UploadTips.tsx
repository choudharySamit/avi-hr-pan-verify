"use client";

import { useState } from 'react';

export default function UploadTips() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-sm font-medium text-blue-900">Upload Tips for Better Results</h4>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm text-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">✅ Do's:</h5>
              <ul className="space-y-1">
                <li>• Ensure good lighting</li>
                <li>• Keep the card flat and straight</li>
                <li>• Capture the entire PAN card</li>
                <li>• Use high resolution (at least 1MP)</li>
                <li>• Ensure text is clearly readable</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">❌ Don'ts:</h5>
              <ul className="space-y-1">
                <li>• Avoid blurry or tilted images</li>
                <li>• Don't crop important details</li>
                <li>• Avoid shadows on the card</li>
                <li>• Don't use low-quality scans</li>
                <li>• Avoid reflective surfaces</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-blue-100 rounded-md">
            <p className="text-xs">
              <strong>Note:</strong> The OCR accuracy depends on image quality. 
              For best results, ensure the PAN number, name, and date of birth are clearly visible.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 