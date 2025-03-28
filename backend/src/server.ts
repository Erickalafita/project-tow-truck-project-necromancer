import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Create a simple Express app
const app = express();
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Root endpoint
app.get('/', function(req: Request, res: Response) {
  res.json({ message: 'Server is running' });
});

// API Info endpoint
app.get('/api', function(req: Request, res: Response) {
  res.json({ 
    message: 'API is working',
    version: '1.0.0',
    endpoints: [
      { path: '/api/auth/register', method: 'POST', description: 'Register a user' },
      { path: '/api/auth/login', method: 'POST', description: 'Login a user' }
    ]
  });
});

// Simple auth endpoints
app.post('/api/auth/register', function(req: Request, res: Response) {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Return mock user for testing
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      _id: '1',
      firstName,
      lastName,
      email,
      role: 'user'
    },
    token: 'test-token-1234'
  });
});

app.post('/api/auth/login', function(req: Request, res: Response) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  if (email === 'test@example.com' && password === 'password') {
    return res.status(200).json({
      message: 'User logged in successfully',
      user: {
        _id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user'
      },
      token: 'test-token-1234'
    });
  }
  
  if (email === 'driver@example.com' && password === 'password') {
    return res.status(200).json({
      message: 'User logged in successfully',
      user: {
        _id: '2',
        firstName: 'Test',
        lastName: 'Driver',
        email: 'driver@example.com',
        role: 'driver'
      },
      token: 'test-token-5678'
    });
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

// Necromancy endpoints
app.get('/api/necromancy/requests', function(req: Request, res: Response) {
  res.json({
    message: 'Requests retrieved successfully',
    requests: [
      {
        _id: '1',
        userId: '1',
        userName: 'Test User',
        vehicleDescription: 'Zombie Volkswagen Beetle',
        description: 'Engine makes groaning noises',
        status: 'pending',
        location: {
          address: '123 Haunted Lane, Spookytown',
          coordinates: [40.7128, -74.0060]
        },
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        _id: '2',
        userId: '1',
        userName: 'Test User',
        vehicleDescription: 'Cursed Ford Pickup',
        description: 'Headlights flicker spelling "HELP"',
        status: 'accepted',
        location: {
          address: '456 Phantom Road, Ghostville',
          coordinates: [41.8781, -87.6298]
        },
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 43200000)
      }
    ]
  });
});

app.post('/api/necromancy/requests', function(req: Request, res: Response) {
  const { vehicleDescription, description, location } = req.body;
  
  if (!vehicleDescription || !description || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  res.status(201).json({
    message: 'Request created successfully',
    request: {
      _id: '3',
      userId: '1',
      userName: 'Test User',
      vehicleDescription,
      description,
      status: 'pending',
      location,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

app.patch('/api/necromancy/requests/:id', function(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  res.json({
    message: 'Request updated successfully',
    request: {
      _id: id,
      userId: '1',
      userName: 'Test User',
      vehicleDescription: 'Test Vehicle',
      description: 'Test description',
      status,
      location: {
        address: 'Test address',
        coordinates: [0, 0]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const port = process.env.PORT || 3001;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
