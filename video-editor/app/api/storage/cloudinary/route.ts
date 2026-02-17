import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'lumina-video-agent',
          public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Upload Error:', error);
            resolve(NextResponse.json({ error: error.message }, { status: 500 }));
          } else {
            resolve(NextResponse.json({ 
              success: true, 
              public_id: result?.public_id,
              url: result?.secure_url,
              duration: result?.duration,
              format: result?.format
            }));
          }
        }
      );

      uploadStream.end(buffer);
    });

  } catch (error: any) {
    console.error('[Cloudinary API Error]', error);
    return NextResponse.json({ error: error.message || 'Cloudinary upload failed' }, { status: 500 });
  }
}
