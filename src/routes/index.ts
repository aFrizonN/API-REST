import { Router } from 'express';
import UserController from '../controllers/UserController';
import ProjectController from '../controllers/ProjectController';
import LinkController from '../controllers/LinkController';
import ParameterController from '../controllers/ParameterController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Auth Routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Project Routes (Protected)
router.post('/projects', authMiddleware, ProjectController.create);
router.get('/projects', authMiddleware, ProjectController.list);

// Parameter Routes (Protected/Shared)
router.post('/parameters', authMiddleware, ParameterController.create);
router.get('/parameters', authMiddleware, ParameterController.list);
router.put('/parameters/:id', authMiddleware, ParameterController.update);

// Link Routes (Protected)
router.post('/links', authMiddleware, LinkController.create);
router.get('/projects/:projectId/links', authMiddleware, LinkController.listByProject);
router.put('/links/:id', authMiddleware, LinkController.update);
router.delete('/links/:id', authMiddleware, LinkController.delete);

// Generation Endpoint (Public)
router.get('/links/:id/generate', LinkController.generate);

export default router;
