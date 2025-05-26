import { Response } from 'express';
import { ProjectPlanningItemService } from '../services/projectPlanningItem.service';
import { CustomRequest } from '../interfaces/express.interface';

const planningItemService = new ProjectPlanningItemService();

export const generatePlanningItemController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const item = await planningItemService.generatePlanningItem(userId, projectId, req.body);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating planning item', error: error.message });
  }
};

export const getPlanningItemsByProjectController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const items = await planningItemService.getPlanningItemsByProjectId(userId, projectId);
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching planning items', error: error.message });
  }
};

export const getPlanningItemByIdController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { itemId } = req.params; // Changed from planningId or similar to generic itemId
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const item = await planningItemService.getPlanningItemById(userId, itemId);
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: 'Planning item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching planning item', error: error.message });
  }
};

export const updatePlanningItemController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { itemId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const item = await planningItemService.updatePlanningItem(userId, itemId, req.body);
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: 'Planning item not found for update' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating planning item', error: error.message });
  }
};

export const deletePlanningItemController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { itemId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    await planningItemService.deletePlanningItem(userId, itemId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting planning item', error: error.message });
  }
};
