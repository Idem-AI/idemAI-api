import { Request, Response } from 'express';
import { BrandingService } from '../services/branding.service';
import { CustomRequest } from '../interfaces/express.interface';

const brandingService = new BrandingService();

export const generateBrandingController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const branding = await brandingService.generateBranding(userId, projectId, req.body);
    res.status(201).json(branding);
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating branding', error: error.message });
  }
};

export const getBrandingsByProjectController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const brandings = await brandingService.getBrandingsByProjectId(userId, projectId);
    res.status(200).json(brandings);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching brandings', error: error.message });
  }
};

export const getBrandingByIdController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { brandingId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const branding = await brandingService.getBrandingById(userId, brandingId);
    if (branding) {
      res.status(200).json(branding);
    } else {
      res.status(404).json({ message: 'Branding not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching branding', error: error.message });
  }
};

export const updateBrandingController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { brandingId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const branding = await brandingService.updateBranding(userId, brandingId, req.body);
    if (branding) {
      res.status(200).json(branding);
    } else {
      res.status(404).json({ message: 'Branding not found for update' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating branding', error: error.message });
  }
};

export const deleteBrandingController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { brandingId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    await brandingService.deleteBranding(userId, brandingId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting branding', error: error.message });
  }
};
