import { supabase } from './supabase';

/**
 * Uploads a file to Cloudinary via our internal API proxy
 * @param file The file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/storage/cloudinary', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Cloudinary upload failed');
  }

  return data.url;
}

/**
 * Uploads a file to Supabase Storage
 * @param file The file to upload
 * @param path The path within the bucket (default: random filename)
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(file: File, path?: string) {
  const bucket = 'Lumina web3 file storage';
  const fileName = path || `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('[StorageUtility] Upload Error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}
