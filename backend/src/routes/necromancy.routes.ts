import express, { Response, RequestHandler } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import necromancyController from '../controllers/necromancy.controller';

const router = express.Router();

// Use type assertion for middleware
const auth = authenticateToken as RequestHandler;

// Add a root GET handler for the /api/necromancy path
router.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Necromancy API is running',
    endpoints: [
      { method: 'POST', path: '/requests', description: 'Create a new necromancy request' },
      { method: 'GET', path: '/requests', description: 'Get all necromancy requests' },
      { method: 'PATCH', path: '/requests/:id', description: 'Update a request status' }
    ] 
  });
});

// Routes with type assertions to satisfy TypeScript
router.post('/requests', auth, ((req: AuthRequest, res: Response) => {
  return necromancyController.createRequest(req, res);
}) as RequestHandler);

router.get('/requests', auth, ((req: AuthRequest, res: Response) => {
  return necromancyController.getRequests(req, res);
}) as RequestHandler);

router.patch('/requests/:id', auth, ((req: AuthRequest, res: Response) => {
  return necromancyController.updateRequestStatus(req, res);
}) as RequestHandler);

export default router; 