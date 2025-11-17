import { v2 as cloudinary } from 'cloudinary';
import { createReadStream } from 'fs';
import { resolve } from 'path';

const isCloudinary = process.env.STORAGE_PROVIDER === 'cloudinary';

if (isCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export async function uploadToCloudinary(localPath, key) {
  if (!isCloudinary) throw new Error('Cloudinary not enabled');
  
  // Resolve to absolute path (resolve() handles both relative and absolute paths)
  const absolutePath = resolve(localPath);
  
  // Extract file extension from the key (which includes the filename)
  const ext = key.toLowerCase().split('.').pop();
  
  // Determine resource type - use 'raw' for PDFs and documents to preserve integrity
  let resourceType = 'auto';
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    resourceType = 'raw';
  }
  
  // Extract folder and filename from key (format: "docs/filename.ext")
  const parts = key.split('/');
  const folder = parts.length > 1 ? parts[0] : 'docs';
  const filename = parts.length > 1 ? parts.slice(1).join('/') : key;
  
  // For public_id, remove extension (Cloudinary handles it)
  const publicId = filename.replace(/\.[^/.]+$/, '');
  
  return new Promise((resolvePromise, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        public_id: publicId,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          let fileUrl = result.secure_url;
          
          // For raw files, append the extension to the URL if not present
          // This ensures browsers can identify the file type
          if (resourceType === 'raw' && ext) {
            // Check if URL already has the extension
            const urlWithoutQuery = fileUrl.split('?')[0];
            if (!urlWithoutQuery.endsWith(`.${ext}`)) {
              fileUrl = `${fileUrl}.${ext}`;
            }
          }
          
          resolvePromise(fileUrl);
        }
      }
    );

    const fileStream = createReadStream(absolutePath);
    
    fileStream.on('error', (err) => {
      reject(err);
    });
    
    fileStream.pipe(uploadStream);
  });
}

export const isCloudinaryEnabled = isCloudinary;

