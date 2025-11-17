import multer from 'multer';
import { extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
const absoluteUploadsDir = resolve(__dirname, '..', '..', uploadsDir);

// Ensure uploads directory exists
try {
  mkdirSync(absoluteUploadsDir, { recursive: true });
} catch (error) {
  // Directory might already exist, ignore error
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, absoluteUploadsDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  }
});

// Limit: 10MB, accept docs and pdf/images
function fileFilter(req, file, cb) {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Invalid file format'), false);
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});
