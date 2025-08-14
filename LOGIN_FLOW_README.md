# PAN Verification System - Login Flow

This document describes the complete login flow implementation for the PAN Verification System.

## Features

### 🔐 Authentication System
- **User Registration**: New users can create accounts with email and password
- **User Login**: Secure login with email and password authentication
- **Session Management**: Persistent login sessions using localStorage
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Logout Functionality**: Secure logout with session cleanup

### 🎨 User Interface
- **Modern Design**: Clean, responsive UI using Tailwind CSS
- **Loading States**: Smooth loading indicators during authentication
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation for better UX
- **Responsive Layout**: Works on desktop and mobile devices

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.ts          # Login API endpoint
│   │       └── register/
│   │           └── route.ts          # Registration API endpoint
│   ├── dashboard/
│   │   └── page.tsx                  # Dashboard page (protected)
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── register/
│   │   └── page.tsx                  # Registration page
│   ├── layout.tsx                    # Root layout with AuthProvider
│   └── page.js                       # Main PAN verification page
├── components/
│   └── ProtectedRoute.tsx            # Protected route wrapper
├── contexts/
│   └── AuthContext.tsx               # Authentication context
└── middleware.ts                     # Authentication middleware
```

## Components Overview

### 1. AuthContext (`src/contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides login, register, and logout functions
- Handles session persistence with localStorage
- Exports `useAuth` hook for easy access

### 2. Login Page (`src/app/login/page.tsx`)
- Clean login form with email and password
- Form validation and error handling
- Loading states during authentication
- Link to registration page

### 3. Registration Page (`src/app/register/page.tsx`)
- User registration form with validation
- Password confirmation
- Terms of service agreement
- Link to login page

### 4. Dashboard (`src/app/dashboard/page.tsx`)
- Protected route requiring authentication
- User welcome message
- Quick action cards
- Logout functionality

### 5. ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- Wrapper component for protected pages
- Automatic redirection to login if not authenticated
- Loading state while checking authentication

### 6. Middleware (`src/middleware.ts`)
- Server-side route protection
- Automatic redirects based on authentication status
- Handles both client and server-side routing

## API Endpoints

### POST `/api/auth/login`
- **Purpose**: Authenticate user with email and password
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ user: User, token: string, message: string }`

### POST `/api/auth/register`
- **Purpose**: Register new user
- **Request Body**: `{ name: string, email: string, password: string }`
- **Response**: `{ user: User, token: string, message: string }`

## Authentication Flow

### 1. User Registration
1. User visits `/register`
2. Fills out registration form
3. Form validation (email format, password length, etc.)
4. API call to `/api/auth/register`
5. On success: Store token and user data in localStorage
6. Redirect to `/dashboard`

### 2. User Login
1. User visits `/login`
2. Enters email and password
3. API call to `/api/auth/login`
4. On success: Store token and user data in localStorage
5. Redirect to `/dashboard`

### 3. Protected Route Access
1. User tries to access protected route (e.g., `/dashboard`)
2. Middleware checks for authentication token
3. If no token: Redirect to `/login`
4. If token exists: Allow access

### 4. Logout
1. User clicks logout button
2. Clear localStorage (token and user data)
3. Redirect to `/login`

## Demo Users

For testing purposes, the following users are pre-configured:

| Email | Password | Name |
|-------|----------|------|
| john@example.com | password123 | John Doe |
| jane@example.com | password123 | Jane Smith |

## Security Considerations

⚠️ **Important**: This is a demonstration implementation. For production use, consider:

1. **Password Hashing**: Use bcrypt or similar for password storage
2. **JWT Tokens**: Implement proper JWT token generation and validation
3. **Database**: Use a real database instead of in-memory storage
4. **HTTPS**: Ensure all communications are encrypted
5. **Rate Limiting**: Implement rate limiting for login attempts
6. **Input Validation**: Add server-side validation
7. **CSRF Protection**: Implement CSRF tokens
8. **Session Management**: Use secure session management

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Open `http://localhost:3000`
   - You'll be redirected to login if not authenticated
   - Use demo credentials or register a new account

## Usage Examples

### Using the Auth Context
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('email', 'password')}>Login</button>
      )}
    </div>
  );
}
```

### Protecting a Route
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

## Customization

### Styling
- All components use Tailwind CSS classes
- Colors and styling can be customized in `tailwind.config.js`
- Component styles are modular and easy to modify

### Authentication Logic
- Modify `AuthContext.tsx` to change authentication behavior
- Update API endpoints for different backend implementations
- Customize validation rules in registration and login forms

### Routes
- Add new protected routes to the middleware configuration
- Update the `protectedRoutes` array in `middleware.ts`
- Create new pages and wrap them with `ProtectedRoute` component

## Troubleshooting

### Common Issues

1. **Login not working**: Check browser console for API errors
2. **Redirect loops**: Ensure middleware configuration is correct
3. **Styling issues**: Verify Tailwind CSS is properly configured
4. **TypeScript errors**: Check import paths and type definitions

### Debug Mode
Enable debug logging by adding console.log statements in the AuthContext or API endpoints.

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub, etc.)
- [ ] User profile management
- [ ] Activity logging
- [ ] Admin dashboard
- [ ] Role-based access control 