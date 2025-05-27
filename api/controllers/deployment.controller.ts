import { Response } from 'express';
import { DeploymentService } from '../services/Deployment/deployment.service';
import { CustomRequest } from '../interfaces/express.interface';

const deploymentService = new DeploymentService();

export const generateDeploymentController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const deployment = await deploymentService.generateDeployment(userId, projectId, req.body);
    res.status(201).json(deployment);
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating deployment', error: error.message });
  }
};

export const getDeploymentsByProjectController = async (req: CustomRequest, res: Response): Promise<void> => {
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
    const deployments = await deploymentService.getDeploymentsByProjectId(userId, projectId);
    res.status(200).json(deployments);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching deployments', error: error.message });
  }
};

export const getDeploymentByIdController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const deployment = await deploymentService.getDeploymentById(userId, deploymentId);
    if (deployment) {
      res.status(200).json(deployment);
    } else {
      res.status(404).json({ message: 'Deployment not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching deployment', error: error.message });
  }
};

export const updateDeploymentController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const deployment = await deploymentService.updateDeployment(userId, deploymentId, req.body);
    if (deployment) {
      res.status(200).json(deployment);
    } else {
      res.status(404).json({ message: 'Deployment not found for update' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating deployment', error: error.message });
  }
};

export const deleteDeploymentController = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    await deploymentService.deleteDeployment(userId, deploymentId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting deployment', error: error.message });
  }
};
