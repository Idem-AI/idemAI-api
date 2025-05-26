import { Response } from 'express';
import { DevelopmentService } from '../services/development.service';
import { CustomRequest } from '../interfaces/express.interface';

const developmentService = new DevelopmentService();

export const generateDevelopmentController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const development = await developmentService.generateDevelopment(userId, projectId, req.body);
    res.status(201).json(development);
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating development item', error: error.message });
  }
};

export const getDevelopmentsByProjectController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const developments = await developmentService.getDevelopmentsByProjectId(userId, projectId);
    res.status(200).json(developments);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching development items', error: error.message });
  }
};

export const getDevelopmentByIdController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { developmentId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const development = await developmentService.getDevelopmentById(userId, developmentId);
    if (development) {
      res.status(200).json(development);
    } else {
      res.status(404).json({ message: 'Development item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching development item', error: error.message });
  }
};

export const updateDevelopmentController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { developmentId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const development = await developmentService.updateDevelopment(userId, developmentId, req.body);
    if (development) {
      res.status(200).json(development);
    } else {
      res.status(404).json({ message: 'Development item not found for update' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating development item', error: error.message });
  }
};

export const deleteDevelopmentController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { developmentId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    await developmentService.deleteDevelopment(userId, developmentId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting development item', error: error.message });
  }
};
