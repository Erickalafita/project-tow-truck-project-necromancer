# Project Necromancer - Tow Truck Service Platform

A modern web application for tow truck service management with real-time updates and tracking.

## Features

- **User Authentication**: Secure registration and login system with role-based access
- **Request Management**: Create, track, and manage tow service requests
- **Real-time Updates**: Get instant updates on request status changes
- **Role-based Access Control**: Different interfaces for customers, drivers, and administrators
- **Location Services**: GPS tracking and map integration for precise service locations

## Tech Stack

### Backend
- Node.js with Express
- MongoDB (with fallback to in-memory mock database)
- JWT for authentication
- Socket.io for real-time updates

### Frontend
- Next.js (React framework)
- TypeScript
- Tailwind CSS for styling
- Google Maps integration

## Project Structure

```
project-necromancer/
├── backend/               # Backend Express server
│   ├── src/               # TypeScript source files
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── app.ts         # Express application setup
│   │   └── server.ts      # Server entry point
│   ├── server.js          # Simple JavaScript server for testing
│   └── uploads/           # File uploads directory
├── frontend/              # Next.js frontend application
│   ├── components/        # React components
│   ├── pages/             # Next.js pages
│   ├── public/            # Static assets
│   └── styles/            # CSS styles
└── docs/                  # Documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Erickalafita/project-tow-trcuk-project-necromancer.git
   cd project-necromancer
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```
   PORT=3001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

   Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Start the development servers**
   
   In the project root:
   ```bash
   # Start the backend server
   cd backend
   npm run dev

   # In a new terminal, start the frontend server
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Necromancy Requests (Tow Truck Services)
- `GET /api/necromancy/requests` - Get all requests (for admin/driver) or user's requests
- `POST /api/necromancy/requests` - Create a new request
- `PATCH /api/necromancy/requests/:id` - Update request status
- `DELETE /api/necromancy/requests/:id` - Delete a request

### Driver Management
- `GET /api/driver/requests` - Get available requests
- `PATCH /api/driver/requests/:id/accept` - Accept a request
- `PATCH /api/driver/requests/:id/complete` - Complete a request

## Test Accounts

For testing purposes, you can use the following credentials:

- **Regular User**:
  - Email: `test@example.com`
  - Password: `password`

- **Driver**:
  - Email: `driver@example.com`
  - Password: `password`

- **Admin**:
  - Email: `admin@example.com`
  - Password: `password`

## Troubleshooting

### Common Issues

1. **Backend server not starting**
   - Check if the port is already in use
   - Verify MongoDB connection (if using)
   - Ensure all dependencies are installed

2. **Authentication errors**
   - Make sure JWT_SECRET is set in your .env file
   - Check token expiration

3. **"404 Not Found" errors on frontend**
   - Verify API endpoints in Next.js config 
   - Check if backend server is running
   - Ensure the correct paths are configured in `next.config.js`

4. **MongoDB connection issues**
   - If you're facing MongoDB connection issues, the application will fall back to an in-memory mock database

## License

[MIT License](LICENSE)

## Contributors

- Erick Alafita- Initial work

## Setting Up GitHub Step by Step

1. **Create a GitHub account** at [github.com](https://github.com) if you don't already have one

2. **Create a new repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name it "project-tow-truck-project-necromancer"
   - Add a description
   - Keep it public or make it private
   - Click "Create repository"

3. **Run these commands on your local machine**:

   ```bash
   # Navigate to your project directory
   cd /Users/erick/project\ tow\ truck\ project\ necromancer
   
   # Initialize Git if not already done
   git init
   
   # Add your GitHub repository as the remote
   git remote add origin https://github.com/Erickalafita/project-tow-trcuk-project-necromancer.git
   
   # Push your code
   git push -u origin main
   ```

4. **Create a .gitignore file** to avoid pushing sensitive files:

   ```bash
   # Create .gitignore file
   echo "node_modules/
   .env
   .env.local
   .DS_Store
   logs/
   *.log
   dist/
   build/
   coverage/" > .gitignore
   
   # Add and commit it
   git add .gitignore
   git commit -m "Add .gitignore file"
   git push
   ```

Would you like more specific guidance on any of these steps?
