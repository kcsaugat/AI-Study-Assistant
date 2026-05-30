import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFileHandler } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Use memory storage for Vercel serverless environment
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post('/', upload.single('file'), uploadFileHandler);

export default router;
