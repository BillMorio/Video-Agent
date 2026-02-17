import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary only if keys are present (server-side)
if (process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a Buffer to Cloudinary (Server-side)
 * @param buffer The file buffer
 * @param fileName Original or preferred filename
 * @param resourceType 'image' | 'video' | 'auto'
 * @returns The public URL of the uploaded file
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer, 
  fileName: string, 
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'lumina-video-agent',
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, "")}`,
      },
      (error, result) => {
        if (error) {
          console.error('[StorageServer] Cloudinary Upload Error:', error);
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );

    uploadStream.end(buffer);
  });
}
