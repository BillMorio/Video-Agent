import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.HEY_GEN_API;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'HEY_GEN_API key is not configured' }, 
      { status: 500 }
    );
  }

  try {
    const { source_url, name } = await request.json();

    if (!source_url) {
      return NextResponse.json({ error: 'source_url is required' }, { status: 400 });
    }

    console.log('[Heygen Registration] Step 1/3: Downloading image from URL...');
    const imageResponse = await fetch(source_url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from URL: ${imageResponse.statusText}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    console.log('[Heygen Registration] Step 2/3: Uploading asset to Heygen...');
    // We use the verified v1/asset endpoint on upload.heygen.com
    const uploadResponse = await fetch('https://upload.heygen.com/v1/asset', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'content-type': contentType,
      },
      body: Buffer.from(imageBuffer),
    });

    const uploadText = await uploadResponse.text();
    console.log('[Heygen Registration] Upload Response:', uploadResponse.status, uploadText);

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: `Asset upload failed (${uploadResponse.status}): ${uploadText.substring(0, 200)}` },
        { status: uploadResponse.status }
      );
    }

    const uploadData = JSON.parse(uploadText);
    // V1 upload returns { data: { image_key: "..." } } or just { image_key: "..." }
    const imageKey = uploadData.data?.image_key || uploadData.image_key;

    if (!imageKey) {
      throw new Error('No image_key returned from asset upload');
    }

    console.log('[Heygen Registration] Step 3/3: Creating avatar group...');
    // Use the verified v2/photo_avatar/avatar_group/create endpoint
    const createResponse = await fetch('https://api.heygen.com/v2/photo_avatar/avatar_group/create', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        name: name || `Talking Photo ${Date.now()}`,
        image_key: imageKey
      }),
    });

    const createText = await createResponse.text();
    console.log('[Heygen Registration] Create Response:', createResponse.status, createText);

    if (!createResponse.ok) {
      return NextResponse.json(
        { error: `Avatar group creation failed (${createResponse.status}): ${createText.substring(0, 200)}` },
        { status: createResponse.status }
      );
    }

    const createData = JSON.parse(createText);
    
    // The response includes { data: { id: "...", group_id: "...", ... } }
    // We normalize this for the playground so Step 1 returns the photo_id
    return NextResponse.json({
      data: {
        talking_photo_id: createData.data?.id || createData.data?.group_id,
        ...createData.data
      }
    });

  } catch (error: any) {
    console.error('Error registering Heygen talking photo:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
