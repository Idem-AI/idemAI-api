import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../index'; // Corrected import path for authenticate middleware

const router = Router();

// Create a new project
router.post('/', authenticate, projectController.createProject);

// Get all projects for the authenticated user
router.get('/', authenticate, projectController.getAllProjects);

// Get a specific project by ID
router.get('/:projectId', projectController.getProjectById);

// Update a specific project by ID
router.put('/:projectId', authenticate, projectController.updateProject);

// Delete a specific project by ID
router.delete('/:projectId', authenticate, projectController.deleteProject);

export const projectRoutes = router;
