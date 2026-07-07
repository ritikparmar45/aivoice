import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { analyzeAudio } from '../controllers/analyzeController.js';
import { consentValidator } from '../middleware/consentValidator.js';
import { audioValidator } from '../middleware/audioValidator.js';
import { env } from '../config/env.js';
import { BadRequestError } from '../utils/customErrors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const router = express.Router();

// Define temporary uploads path
const uploadsDir = path.join(__dirname, '../uploads');
fs.ensureDirSync(uploadsDir);

// Configure Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `speech-${uniqueSuffix}${ext}`);
  },
});

// Configure Multer limits and general file extensions
const upload = multer({
  storage: storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Validation failed: File extension "${ext}" is not supported. Please upload MP3, WAV, M4A, WEBM, or OGG.`
        ),
        false
      );
    }
  },
});

// Define core API path
router.post(
  '/analyze',
  upload.single('audio'),
  consentValidator,
  audioValidator,
  analyzeAudio
);

export default router;
