import { Response } from 'express';
import { DiagramService } from '../services/diagram.service';
import { CustomRequest } from '../interfaces/express.interface';

const diagramService = new DiagramService();

export const generateDiagramController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const diagram = await diagramService.generateDiagram(userId, projectId, req.body);
    res.status(201).json(diagram);
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating diagram', error: error.message });
  }
};

export const getDiagramsByProjectController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const diagrams = await diagramService.getDiagramsByProjectId(userId, projectId);
    res.status(200).json(diagrams);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching diagrams', error: error.message });
  }
};

export const getDiagramByIdController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { diagramId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const diagram = await diagramService.getDiagramById(userId, diagramId);
    if (diagram) {
      res.status(200).json(diagram);
    } else {
      res.status(404).json({ message: 'Diagram not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching diagram', error: error.message });
  }
};

export const updateDiagramController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { diagramId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const diagram = await diagramService.updateDiagram(userId, diagramId, req.body);
    if (diagram) {
      res.status(200).json(diagram);
    } else {
      res.status(404).json({ message: 'Diagram not found for update' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating diagram', error: error.message });
  }
};

export const deleteDiagramController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { diagramId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    await diagramService.deleteDiagram(userId, diagramId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting diagram', error: error.message });
  }
};
