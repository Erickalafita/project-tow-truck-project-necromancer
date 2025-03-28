import { Request, Response } from 'express';
import towingService from '../services/towing.service';
import logger from '../utils/logger';

/**
 * Create a new towing request
 */
async function createTowingRequest(req: Request, res: Response) {
  try {
    const towingRequestData = req.body;
    const newTowingRequest = await towingService.createTowingRequest(towingRequestData);
    logger.info(`Creating ${newTowingRequest} to the logs`);
    res.status(201).json(newTowingRequest);
  } catch (error: any) {
    logger.error(`Could not creating ${error}`, { error });
    res.status(500).json({ message: error.message });
  }
}

/**
 * Get a towing request by ID
 */
async function getTowingRequestById(req: Request, res: Response) {
  try {
    const towingRequestId = req.params.id;
    const towingRequest = await towingService.getTowingRequestById(towingRequestId);
    if (towingRequest) {
      res.json(towingRequest);
    } else {
      res.status(404).json({ message: 'Towing request not found' });
    }
  } catch (error: any) {
    logger.error(`Could not getting ${error}`, { error });
    res.status(500).json({ message: error.message });
  }
}

/**
 * Update a towing request by ID
 */
async function updateTowingRequest(req: Request, res: Response) {
  try {
    const towingRequestId = req.params.id;
    const updatedTowingRequestData = req.body;
    const updatedTowingRequest = await towingService.updateTowingRequest(towingRequestId, updatedTowingRequestData);
    if (updatedTowingRequest) {
      res.json(updatedTowingRequest);
    } else {
      res.status(404).json({ message: 'Towing request not found' });
    }
  } catch (error: any) {
    logger.error(`Could not updating ${error}`, { error });
    res.status(500).json({ message: error.message });
  }
}

/**
 * Delete a towing request by ID
 */
async function deleteTowingRequest(req: Request, res: Response) {
  try {
    const towingRequestId = req.params.id;
    const deleted = await towingService.deleteTowingRequest(towingRequestId);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Towing request not found' });
    }
  } catch (error: any) {
    logger.error(`Could not deleting ${error}`, { error });
    res.status(500).json({ message: error.message });
  }
}

export default {
  createTowingRequest,
  getTowingRequestById,
  updateTowingRequest,
  deleteTowingRequest,
};
