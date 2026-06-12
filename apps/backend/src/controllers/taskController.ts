import { Request, Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.query;
    const filter: any = { userId: req.user?.id };
    if (meetingId) filter.meetingId = meetingId;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      { $set: updates },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority, meetingId } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = new Task({
      userId: req.user?.id,
      title,
      description,
      priority: priority || 'medium',
      status: 'todo',
      // If user creates a task manually without meeting, we may not have meetingId.
      // But the model requires meetingId currently: `meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true }`
      // Wait, let's fix task model to allow optional meetingId if they create it independently,
      // Or we provide a dummy meetingId? Or we just remove required from meetingId in Task schema?
      // Let's pass it if provided, else we need to update Task model to make meetingId optional.
      meetingId
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

