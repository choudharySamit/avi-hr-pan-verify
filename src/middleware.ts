import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Temporarily disabled to resolve routesManifest error
  // Authentication is handled client-side via ProtectedRoute component
  return NextResponse.next();
}

export const config = {
  matcher: []
}; 