import { Router } from 'express';
import { getTasks, updateTask, createTask } from '../controllers/taskController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);

export default router;
