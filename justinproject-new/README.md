# Secure Authentication System

A comprehensive, secure authentication system designed to prevent SQL injection attacks and enhance overall application security.

## Key Security Features

- **Input Validation & Sanitization**: Comprehensive input validation to prevent malicious inputs
- **Parameterized Queries**: Using Prisma ORM to eliminate SQL injection vulnerabilities
- **SQL Injection Detection**: Active monitoring for SQL injection patterns in user inputs
- **IP-based Rate Limiting**: Prevents brute force attacks
- **Account Lockout**: Temporary account locking after multiple failed attempts
- **Comprehensive Logging**: Detailed security event logging for auditing
- **Generic Error Messages**: User-friendly errors that don't leak system information
- **JWT Authentication**: Secure token-based authentication flow
- **Password Hashing**: Secure password storage using bcrypt

## Backend Architecture

The backend is built with Express.js and organized into modules:

- **Controllers**: Handle request/response logic
- **Services**: Contain core business logic
- **Middleware**: Implement security features
- **Utils**: Provide helper functions
- **Routes**: Define API endpoints

## Database Schema

The system uses Prisma ORM with a SQLite database (can be easily switched to PostgreSQL, MySQL, etc.) with the following models:

- **User**: Stores user credentials and security-related fields
- **SecurityLog**: Records security events for auditing

## Setup Instructions

1. Clone the repository
2. Copy `.env.example` to `.env` and configure environment variables
3. Install dependencies:
   ```
   npm install
   ```
4. Initialize the database:
   ```
   npx prisma migrate dev
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Authenticate a user
- **POST /api/auth/logout**: Log out a user
- **GET /api/auth/profile**: Get authenticated user profile

## Frontend

The frontend provides a simple React interface for:

- User registration
- Secure login
- User dashboard
- Logout functionality

## Security Best Practices

- All user inputs are validated and sanitized
- Passwords are hashed with bcrypt
- JWT tokens are signed with a secure secret
- Error messages don't reveal sensitive information
- Request rate limiting prevents brute force attacks
- SQL injection patterns are actively detected and blocked
- Security events are comprehensively logged