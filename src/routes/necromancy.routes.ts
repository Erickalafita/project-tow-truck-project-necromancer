import express from 'express';
import necromancyController from '../controllers/necromancy.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticateToken, necromancyController.createNecromancyRequest);
router.get('/:id', authenticateToken, necromancyController.getNecromancyRequestById);
router.put('/:id', authenticateToken, necromancyController.updateNecromancyRequest);
router.delete('/:id', authenticateToken, necromancyController.deleteNecromancyRequest);
router.patch('/:id/accept', authenticateToken, necromancyController.acceptNecromancyRequest); // Driver accepts the request
router.get('/', authenticateToken, necromancyController.getNecromancyRequestsByUserId);

export default router; 