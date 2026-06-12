import { Request, Response } from 'express';
import Meeting from '../models/Meeting';
import Task from '../models/Task';
import { AuthRequest } from '../middlewares/authMiddleware';
import path from 'path';
import fs from 'fs';
import { processMeetingJob } from '../services/jobProcessor';

export const uploadMeetingFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, language } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const isVideo = ['.mp4', '.mov', '.avi', '.mkv'].includes(fileExt);
    const isAudio = ['.mp3', '.wav', '.m4a', '.ogg'].includes(fileExt);

    if (!isVideo && !isAudio) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid file type. Only audio and video are supported.' });
    }

    const sourceType = isVideo ? 'video' : 'audio';

    const meeting = new Meeting({
      title,
      userId: req.user?.id,
      status: 'processing',
      sourceType,
      language: language || 'en-US',
      fileUrl: req.file.path, // In a real app, this would be an S3 URL
    });

    await meeting.save();

    // Trigger async processing here
    processMeetingJob(meeting.id);

    res.status(201).json(meeting);
  } catch (error) {
    console.error(error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Server error during upload' });
  }
};

export const createMeetingText = async (req: AuthRequest, res: Response) => {
  try {
    const { title, text } = req.body;
    if (!title || !text) {
      return res.status(400).json({ error: 'Title and text are required' });
    }

    const meeting = new Meeting({
      title,
      userId: req.user?.id,
      status: 'processing',
      sourceType: 'text',
      transcript: text,
    });

    await meeting.save();

    // Trigger async processing here
    processMeetingJob(meeting.id);

    res.status(201).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const meetings = await Meeting.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMeetingById = async (req: AuthRequest, res: Response) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findOne({ _id: id, userId: req.user?.id });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Delete associated tasks
    await Task.deleteMany({ meetingId: id });

    // Delete uploaded file if it exists
    if (meeting.fileUrl && fs.existsSync(meeting.fileUrl)) {
      try {
        fs.unlinkSync(meeting.fileUrl);
      } catch (fileErr) {
        console.error("Error deleting physical file:", fileErr);
      }
    }

    await Meeting.deleteOne({ _id: id });
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during deletion' });
  }
};

export const reprocessMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findOne({ _id: id, userId: req.user?.id });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    meeting.status = 'processing';
    meeting.summary = '';
    if (meeting.sourceType === 'audio' || meeting.sourceType === 'video') {
      meeting.transcript = '';
    }

    // Delete existing tasks to prevent duplication upon reprocessing
    await Task.deleteMany({ meetingId: id });
    await meeting.save();

    // Trigger async processing
    processMeetingJob(meeting.id);

    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during reprocessing' });
  }
};
