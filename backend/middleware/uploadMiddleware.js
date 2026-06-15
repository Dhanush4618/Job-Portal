import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/resumes directory exists
const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate clean unique filename with timestamps
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname).toLowerCase();
    const cleanBaseName = path.basename(file.originalname, fileExt)
      .replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${cleanBaseName}-${uniqueSuffix}${fileExt}`);
  },
});

// Restrict uploads strictly to PDFs
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (fileExt !== '.pdf' || file.mimetype !== 'application/pdf') {
    return cb(new Error('Invalid file type. Only PDF resumes are accepted!'), false);
  }
  cb(null, true);
};

// Limit uploads to 10MB
const uploadResume = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default uploadResume;
