import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import { uploadMeetingFile, createMeetingText, getUserMeetings, getMeetingById, deleteMeeting, reprocessMeeting } from '../controllers/meetingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadMeetingFile);
router.post('/text', createMeetingText);
router.get('/', getUserMeetings);
router.get('/:id', getMeetingById);
router.delete('/:id', deleteMeeting);
router.post('/:id/reprocess', reprocessMeeting);

export default router;
