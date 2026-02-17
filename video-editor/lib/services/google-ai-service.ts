/**
 * Google AI Service
 * Veo 3.1 (video generation) + Imagen (image generation)
 */

const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

export interface VideoGenerationOptions {
  aspectRatio?: '16:9' | '9:16' | '1:1';
  model?: 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview' | 'veo-3.0-fast-generate-001';
  pollIntervalMs?: number;
  maxWaitMs?: number;
}

export interface VideoGenerationResult {
  videoUrl: string;
  localPath?: string;
  format: string;
  operationId: string;
}

export interface ImageGenerationOptions {
  numberOfImages?: number;
  style?: string;
}

export interface ImageGenerationResult {
  images: Array<{
    base64: string;
    mimeType: string;
  }>;
}

/**
 * Generate motion graphic / video using Veo 3.1
 * This is an async operation that requires polling
 */
export async function generateMotionGraphic(
  prompt: string,
  options: VideoGenerationOptions = {}
): Promise<VideoGenerationResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }

  const {
    aspectRatio = '16:9',
    model = 'veo-3.1-fast-generate-preview',
    pollIntervalMs = 5000,
    maxWaitMs = 300000, // 5 minutes max
  } = options;

  console.log('[Google AI] Starting Veo video generation:', {
    promptLength: prompt.length,
    aspectRatio,
    model,
  });

  // Start the long-running operation
  const startResponse = await fetch(
    `${GOOGLE_AI_API_URL}/models/${model}:predictLongRunning?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt,
        }],
        parameters: {
          aspectRatio,
        },
      }),
    }
  );

  if (!startResponse.ok) {
    const error = await startResponse.text();
    throw new Error(`Veo generation failed to start: ${startResponse.status} - ${error}`);
  }

  const startData = await startResponse.json();
  const operationName = startData.name;
  const operationId = operationName.split('/').pop();

  console.log('[Google AI] Veo operation started:', operationId);

  // Poll for completion
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

    const statusResponse = await fetch(
      `${GOOGLE_AI_API_URL}/${operationName}?key=${apiKey}`
    );

    if (!statusResponse.ok) {
      console.warn('[Google AI] Status check failed, retrying...');
      continue;
    }

    const statusData = await statusResponse.json();

    if (statusData.done) {
      if (statusData.error) {
        throw new Error(`Veo generation failed: ${statusData.error.message}`);
      }

      const videoUri = statusData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      
      if (!videoUri) {
        throw new Error('No video URI in response');
      }

      // Append API key for download
      const downloadUrl = `${videoUri}&key=${apiKey}`;

      console.log('[Google AI] Veo video generated successfully');

      return {
        videoUrl: downloadUrl,
        format: 'mp4',
        operationId,
      };
    }

    console.log('[Google AI] Veo still processing...');
  }

  throw new Error('Veo generation timed out');
}

/**
 * Download video from Veo result to buffer
 */
export async function downloadVideo(videoUrl: string): Promise<Buffer> {
  const response = await fetch(videoUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate image using Imagen (via Gemini)
 */
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }

  const {
    numberOfImages = 1,
    style = '',
  } = options;

  const fullPrompt = style ? `${prompt}, ${style}` : prompt;

  console.log('[Google AI] Generating image with Imagen:', {
    promptLength: fullPrompt.length,
    numberOfImages,
  });

  const response = await fetch(
    `${GOOGLE_AI_API_URL}/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate an image: ${fullPrompt}`
          }]
        }],
        generationConfig: {
          responseModalities: ['image', 'text'],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Imagen generation failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const images: Array<{ base64: string; mimeType: string }> = [];

  if (data.candidates?.[0]?.content?.parts) {
    for (const part of data.candidates[0].content.parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        images.push({
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        });
      }
    }
  }

  if (images.length === 0) {
    throw new Error('No images generated');
  }

  console.log('[Google AI] Imagen generated', images.length, 'image(s)');

  return { images };
}

/**
 * Check available models
 */
export async function listModels(): Promise<any[]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }

  const response = await fetch(
    `${GOOGLE_AI_API_URL}/models?key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.status}`);
  }

  const data = await response.json();
  return data.models || [];
}