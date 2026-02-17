import { 
  getFfmpegInfo, 
  probeMetadata, 
  checkHealth 
} from '../../services/ffmpeg-core.js';
import { 
  convertVideo, 
  resizeVideo, 
  trimVideo, 
  applyFilter,
  generateThumbnail,
  watermarkVideo,
  concatVideos,
  adjustSpeed,
  applyZoom,
  mergeAudioVideo,
  lightLeakTransition,
  batchLightLeakTransition,
  zoomInTransition,
  blurCrossfade,
  zoomOutTransitionLogic,
  radialTransition,
  circleTransition,
  videoKenBurns,
  kenBurns
} from '../../services/video-service.js';
import { extractAudio, trimAudio } from '../../services/audio-service.js';
import path from 'path';
import config from '../../config/storage.js';
import { uploadToCloudinary, downloadFile } from '../../services/storage-service.js';
import { promises as fsPromises } from 'fs';

export const healthCheck = async (req, res) => {
  const isHealthy = await checkHealth();
  if (isHealthy) res.send('OK');
  else res.status(500).send('FFmpeg not ready');
};

export const getInfo = async (req, res) => {
  try {
    const info = await getFfmpegInfo();
    res.json({
      status: 'FFmpeg is available!',
      formatsCount: Object.keys(info.formats).length,
      codecsCount: Object.keys(info.codecs).length,
      sampleFormats: Object.keys(info.formats).slice(0, 20),
      sampleVideoCodecs: Object.keys(info.codecs).filter(c => info.codecs[c].type === 'video').slice(0, 10)
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const probe = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const metadata = await probeMetadata(req.file.path);
    res.json({
      filename: req.file.originalname,
      format: metadata.format,
      streams: metadata.streams
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const convert = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const outPath = await convertVideo(req.file.path, req.body.format);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Conversion complete!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const resize = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const outPath = await resizeVideo(req.file.path, req.body.width, req.body.height);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Video resized!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const trim = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const outPath = await trimVideo(req.file.path, req.body.start, req.body.duration);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Video trimmed!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const filter = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const outPath = await applyFilter(req.file.path, req.body.filter);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: `Filter applied!`,
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const thumbnail = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const outPath = await generateThumbnail(req.file.path, req.body.timestamp);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Thumbnail created!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const audio = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const outPath = await extractAudio(req.file.path);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Audio extracted!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const trimAudioAction = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const outPath = await trimAudio(req.file.path, req.body.start, req.body.duration);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Audio segment processed!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const watermark = async (req, res) => {
  if (!req.files?.video || !req.files?.watermark) {
    return res.status(400).json({ error: 'Both video and watermark files required' });
  }
  try {
    const outPath = await watermarkVideo(req.files.video[0].path, req.files.watermark[0].path);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Watermark added!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const concat = async (req, res) => {
  console.log('[API] Concat Request:', { 
    files: req.files?.map(f => f.originalname), 
    transition: req.body.transition,
    duration: req.body.transitionDuration 
  });
  if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 files required' });
  try {
    const outPath = await concatVideos(req.files, req.body.transition, req.body.transitionDuration);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Videos concatenated!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error('[API] Concat Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const speed = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await adjustSpeed(req.file.path, req.body.targetDuration, req.body.speed);
    const publicUrl = await uploadToCloudinary(result.outputPath);
    res.json({
      success: true,
      message: `Speed adjusted to ${result.speed.toFixed(2)}x`,
      outputFile: `/outputs/${path.basename(result.outputPath)}`,
      publicUrl,
      originalDuration: result.originalDuration.toFixed(2),
      speedApplied: result.speed.toFixed(2)
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || err.stdout || null
    });
  }
};

export const zoom = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const outPath = await applyZoom(req.file.path, req.body);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Zoom effect applied!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({
    success: true,
    message: 'File uploaded successfully',
    filename: path.basename(req.file.path),
    originalName: req.file.originalname,
    path: `/uploads/${path.basename(req.file.path)}`
  });
};

// --- Agent Actions (Work with files already on disk) ---

export const agentProbe = async (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename is required' });
  try {
    const filePath = path.join(config.uploadsDir, filename);
    const metadata = await probeMetadata(filePath);
    res.json({ success: true, metadata });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const agentTrim = async (req, res) => {
  const { filename, start, duration } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename is required' });
  try {
    const filePath = path.join(config.uploadsDir, filename);
    const isAudio = filename.toLowerCase().endsWith('.mp3') || filename.toLowerCase().endsWith('.wav');
    
    // Everything is now 1:1 Narrative Precision. No padding, no handles.
    const outPath = isAudio 
      ? await trimAudio(filePath, start, duration)
      : await trimVideo(filePath, start, duration);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Agent trim complete',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const agentConcat = async (req, res) => {
  const { filenames, transition, duration } = req.body;
  if (!filenames || filenames.length < 2) return res.status(400).json({ error: 'At least 2 filenames required' });
  try {
    const files = filenames.map(f => ({ path: path.join(config.uploadsDir, f) }));
    const outPath = await concatVideos(files, transition, duration);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Agent concat complete',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hardcoded light leak preset URL
const PRESET_LEAK_URL = "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/merged-1770838789313.mp4";

export const projectStitch = async (req, res) => {
  console.log('>>> [BACKEND] projectStitch ENTERED');
  const { sceneUrls, transition, duration, globalSettings, useFadeTransition = true, useLightLeak = false } = req.body;
  
  console.log('[API] Project Stitch Request:', { 
    count: sceneUrls?.length,
    url0: sceneUrls?.[0],
    transition,
    scenesCount: req.body.scenes?.length,
    globalLightLeak: globalSettings?.lightLeakOverlayUrl,
    useFadeTransition,
    useLightLeak
  });

  if (!sceneUrls || sceneUrls.length < 2) {
    return res.status(400).json({ error: 'At least 2 scenes required for stitching' });
  }

  let downloadedPaths = [];
  let overlayPath = null;
  
  try {
    // 1. Download all assets in parallel
    console.log(`[API] Downloading ${sceneUrls.length} scene assets in parallel...`);
    const downloadPromises = sceneUrls.map(url => downloadFile(url));
    downloadedPaths = await Promise.all(downloadPromises);
    
    console.log(`[API] Successfully downloaded ${downloadedPaths.length} assets.`);

    let outPath;

    // 2. Handle Light Leak Transition if requested
    if (useLightLeak) {
      let leakUrl = globalSettings?.lightLeakOverlayUrl;
      
      // If no URL or it's a PNG/Image, use the preset video
      if (!leakUrl || leakUrl.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/)) {
        console.log('[API] Light Leak specificed but URL is missing or an image. Falling back to preset video...');
        leakUrl = PRESET_LEAK_URL;
      }

      console.log(`[API] Cinematic Light Leak using: ${leakUrl}`);
      overlayPath = await downloadFile(leakUrl);
      
      const filesWithOverlay = [
        ...downloadedPaths.map(p => ({ path: p })),
        { path: overlayPath }
      ];

      console.log(`[API] Stitching ${downloadedPaths.length} videos with Batch Light Leak...`);
      outPath = await batchLightLeakTransition(filesWithOverlay, 1.5);
    } else {
      // 3. Normal concatenation with or without fade transitions
      const transitionType = useFadeTransition ? 'fade' : 'none';
      console.log(`[API] Stitching ${downloadedPaths.length} videos with '${transitionType}' transition...`);
      const finalSegments = downloadedPaths.map(p => ({ path: p }));
      outPath = await concatVideos(
        finalSegments, 
        transitionType,
        duration || 1.0 // Transition duration
      );
    }

    // 4. Upload final master to Supabase
    console.log('[API] Uploading production master to storage...');
    const publicUrl = await uploadToCloudinary(outPath);

    // 5. Cleanup temporary files
    console.log('[API] Cleaning up temporary assets...');
    const cleanupPaths = [...downloadedPaths];
    if (overlayPath) cleanupPaths.push(overlayPath);
    
    await Promise.all(cleanupPaths.map(p => fsPromises.unlink(p).catch(e => console.error('Unlink error:', e))));
    
    res.json({
      success: true,
      message: 'Project production stitched successfully!',
      publicUrl,
      outputFile: `/outputs/${path.basename(outPath)}`
    });

  } catch (err) {
    console.error('[API] Project Stitch Error:', err);
    // Attempt cleanup on failure
    const cleanupPaths = [...downloadedPaths];
    if (overlayPath) cleanupPaths.push(overlayPath);
    await Promise.all(cleanupPaths.map(p => fsPromises.unlink(p).catch(() => {})));
    
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || null
    });
  }
};

export const merge = async (req, res) => {
  if (!req.files?.video || !req.files?.audio) {
    return res.status(400).json({ error: 'Both video and audio files required' });
  }
  try {
    const outPath = await mergeAudioVideo(req.files.video[0].path, req.files.audio[0].path);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Muxing complete!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || null
    });
  }
};

export const agentMergeAudioVideo = async (req, res) => {
  const { videoFilename, audioFilename } = req.body;
  if (!videoFilename || !audioFilename) {
    return res.status(400).json({ error: 'Both videoFilename and audioFilename required' });
  }
  try {
    const videoPath = path.join(config.uploadsDir, videoFilename);
    const audioPath = path.join(config.uploadsDir, audioFilename);
    
    // Exact 1:1 sync with 0ms offset
    const outPath = await mergeAudioVideo(videoPath, audioPath, 0);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Agent muxing complete',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || null
    });
  }
};

export const lightLeak = async (req, res) => {
  if (!req.files || req.files.length < 3) return res.status(400).json({ error: 'At least 3 files required: Clip A, Clip B, and Overlay Asset' });
  try {
    const outPath = await lightLeakTransition(req.files, parseFloat(req.body.transitionDuration));
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Professional light leak transition complete!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || null
    });
  }
};

export const batchLightLeak = async (req, res) => {
  if (!req.files || req.files.length < 3) return res.status(400).json({ error: 'At least 2 source clips + 1 overlay required' });
  try {
    const outPath = await batchLightLeakTransition(req.files, parseFloat(req.body.transitionDuration) || 0.8);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Batch light leak complete!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || null
    });
  }
};

export const zoomTransition = async (req, res) => {
  if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 files required: Clip A and Clip B' });
  try {
    const outPath = await zoomInTransition(req.files, parseFloat(req.body.transitionDuration));
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Zoom In transition complete!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ 
      error: err.message,
      details: err.stderr || null
    });
  }
};

export const blurTransition = async (req, res) => {
  if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 files required: Clip A and Clip B' });
  try {
    const outPath = await blurCrossfade(req.files, parseFloat(req.body.transitionDuration));
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Blur Crossfade completed!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ error: err.message, details: err.stderr || null });
  }
};

export const zoomOutTransition = async (req, res) => {
  if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 files required: Clip A and Clip B' });
  try {
    const outPath = await zoomOutTransitionLogic(req.files, parseFloat(req.body.transitionDuration));
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Zoom Out transition complete!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ error: err.message, details: err.stderr || null });
  }
};

export const radialAction = async (req, res) => {
  if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 files required' });
  try {
    const outPath = await radialTransition(req.files, parseFloat(req.body.transitionDuration));
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({ success: true, message: 'Radial transition complete!', outputFile: `/outputs/${path.basename(outPath)}`, publicUrl });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const circleAction = async (req, res) => {
  if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 files required' });
  try {
    const outPath = await circleTransition(req.files, parseFloat(req.body.transitionDuration));
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({ success: true, message: 'Circle transition complete!', outputFile: `/outputs/${path.basename(outPath)}`, publicUrl });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const videoKenBurnsAction = async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Video file required' });
  try {
    const videoFile = req.files[0];
    const outPath = await videoKenBurns(videoFile.path, req.body.zoomType || 'in', req.body.aspectRatio || 'landscape');
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Video Ken Burns complete!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ error: err.message });
  }
};

export const kenBurnsAction = async (req, res) => {
  if (!req.files?.image || !req.files?.audio) {
    return res.status(400).json({ error: 'Both image and audio files required' });
  }
  try {
    const outPath = await kenBurns(req.files.image[0].path, req.files.audio[0].path, req.body.zoomType);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Ken Burns effect applied!',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ error: err.message, details: err.stderr || null });
  }
};

export const agentKenBurns = async (req, res) => {
  const { imageFilename, audioFilename, zoomType } = req.body;
  if (!imageFilename || !audioFilename) {
    return res.status(400).json({ error: 'Both imageFilename and audioFilename required' });
  }
  try {
    const imagePath = path.join(config.uploadsDir, imageFilename);
    const audioPath = path.join(config.uploadsDir, audioFilename);
    const outPath = await kenBurns(imagePath, audioPath, zoomType);
    const publicUrl = await uploadToCloudinary(outPath);
    res.json({
      success: true,
      message: 'Agent Ken Burns complete',
      outputFile: `/outputs/${path.basename(outPath)}`,
      publicUrl
    });
  } catch (err) {
    console.error(`[API] ${req.path} Error:`, err);
    res.status(500).json({ error: err.message, details: err.stderr || null });
  }
};

