import * as googleAi from '../../../services/google-ai-service';
import { uploadBufferToCloudinary } from '../../../storage-server';

/**
 * Generate an image using Google Imagen and upload to Cloudinary
 */
export async function generate_google_image(args: { prompt: string; style?: string }) {
  try {
    console.log('[GoogleTools] Generating image with Imagen:', args.prompt);
    const result = await googleAi.generateImage(args.prompt, { style: args.style });
    
    // Take the first image
    const image = result.images[0];
    const buffer = Buffer.from(image.base64, 'base64');
    
    const cloudinaryUrl = await uploadBufferToCloudinary(
      buffer, 
      `imagen-${Date.now()}.png`, 
      'image'
    );

    return {
      status: 'success',
      imageUrl: cloudinaryUrl,
      message: 'Image generated and uploaded to Cloudinary'
    };
  } catch (err: any) {
    console.error('[GoogleTools] generate_google_image error:', err);
    return { status: 'failed', error: err.message };
  }
}

/**
 * Generate a motion graphic / video using Google Veo 3.1 and upload to Cloudinary
 */
export async function generate_google_video(args: { prompt: string; aspectRatio?: '16:9' | '9:16' | '1:1' }) {
  try {
    console.log('[GoogleTools] Generating video with Veo 3.1:', args.prompt);
    const result = await googleAi.generateMotionGraphic(args.prompt, {
      aspectRatio: args.aspectRatio || '16:9'
    });

    console.log('[GoogleTools] Veo generation complete, downloading output...');
    const buffer = await googleAi.downloadVideo(result.videoUrl);

    console.log('[GoogleTools] Uploading video to Cloudinary...');
    const cloudinaryUrl = await uploadBufferToCloudinary(
      buffer,
      `veo-${Date.now()}.mp4`,
      'video'
    );

    return {
      status: 'success',
      videoUrl: cloudinaryUrl,
      message: 'Motion graphic generated and uploaded to Cloudinary',
      operationId: result.operationId
    };
  } catch (err: any) {
    console.error('[GoogleTools] generate_google_video error:', err);
    return { status: 'failed', error: err.message };
  }
}
