import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import necromancyRoutes from './routes/necromancy.routes';
import driverRoutes from './routes/driver.routes'; // Import driver routes
import cookieParser from 'cookie-parser'; // Import cookie-parser
import multer from 'multer'; // Import multer
import path from 'path';
import fs from 'fs';
import logger from './utils/logger';

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Store files in the "uploads" directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop()); // Generate unique filenames
  }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Use cookie-parser middleware
app.use('/uploads', express.static(uploadsDir)); // Serve uploaded files statically

// Add a root API GET handler
app.get('/api', (req, res) => {
  try {
    res.status(200).json({ 
      message: 'Project Necromancer API is running',
      version: '1.0.0',
      availableEndpoints: [
        { path: '/api/auth', description: 'Authentication endpoints' },
        { path: '/api/necromancy', description: 'Necromancy service endpoints' },
        { path: '/api/driver', description: 'Driver management endpoints' },
        { path: '/api/upload', description: 'File upload endpoint' }
      ] 
    });
  } catch (error) {
    logger.error('Error in root API handler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/necromancy', necromancyRoutes);
app.use('/api/driver', driverRoutes); // Mount driver routes

// File upload route
app.post('/api/upload', upload.single('profilePicture'), (req: express.Request, res: express.Response): void => {
  try {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }

    // req.file contains information about the uploaded file
    console.log(req.file);

    // Return the file URL or path to the client
    res.json({ fileUrl: `/uploads/${req.file.filename}` });
  } catch (error) {
    logger.error('Error in file upload:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Global error handler caught: ${err.message}`, { error: err });
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

export default app;
