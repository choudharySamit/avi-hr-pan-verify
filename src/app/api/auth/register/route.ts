import { NextRequest, NextResponse } from 'next/server';

// In a real application, you would use a database
// This is a simplified example for demonstration purposes
let users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
  },
];

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Hash the password using bcrypt or similar
    // 2. Store user in a database
    // 3. Generate a JWT token
    // 4. Implement proper validation and security measures

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password, // In real app, this would be hashed
    };

    users.push(newUser);

    const token = `token_${newUser.id}_${Date.now()}`; // Simplified token generation

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Registration successful',
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 