import { isCloudinaryEnabled, uploadToCloudinary } from '../utils/cloudinary.js';
import { basename } from 'path';
import { randomUUID } from 'crypto';
 
export async function persistUploadedFile(localPath) {
  // Local dev → return a local URL-ish path; Prod (Cloudinary) → upload and return CDN URL.
  if (!isCloudinaryEnabled) {
    // In real prod behind Nginx, serve /uploads statically.
    return `/${process.env.UPLOADS_DIR || 'uploads'}/${basename(localPath)}`;
  }
  const key = `docs/${randomUUID()}-${basename(localPath)}`;
  return await uploadToCloudinary(localPath, key);
}
