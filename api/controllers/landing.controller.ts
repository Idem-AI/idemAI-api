import { Response } from 'express';
import { LandingService } from '../services/landing.service';
import { CustomRequest } from '../interfaces/express.interface';

const landingService = new LandingService();

export const generateLandingController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { projectId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    if (!projectId) {
      res.status(400).json({ message: 'Project ID is required' });
      return;
    }
    const landing = await landingService.generateLanding(userId, projectId, req.body);
    res.status(201).json(landing);
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating landing page data', error: error.message });
  }
};

export const getLandingsByProjectController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { projectId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    if (!projectId) {
      res.status(400).json({ message: 'Project ID is required' });
      return;
    }
    const landings = await landingService.getLandingsByProjectId(userId, projectId);
    res.status(200).json(landings);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching landing page data', error: error.message });
  }
};

export const getLandingByIdController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { landingId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const landing = await landingService.getLandingById(userId, landingId);
    if (landing) {
      res.status(200).json(landing);
    } else {
      res.status(404).json({ message: 'Landing page data not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching landing page data', error: error.message });
  }
};

export const updateLandingController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { landingId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const landing = await landingService.updateLanding(userId, landingId, req.body);
    if (landing) {
      res.status(200).json(landing);
    } else {
      res.status(404).json({ message: 'Landing page data not found for update' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating landing page data', error: error.message });
  }
};

export const deleteLandingController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { landingId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    await landingService.deleteLanding(userId, landingId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting landing page data', error: error.message });
  }
};
