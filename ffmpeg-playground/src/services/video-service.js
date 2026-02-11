import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import config from '../config/storage.js';
// Force reload for batch light leak

export const convertVideo = (inputPath, outputFormat = 'mp4') => {
  const outputPath = path.join(config.outputsDir, `converted-${Date.now()}.${outputFormat}`);
  
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .on('start', (cmd) => console.log('Started conversion:', cmd))
      .on('end', () => resolve(outputPath))
      .on('error', (err, stdout, stderr) => {
        const error = new Error(err.message);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      })
      .run();
  });
};

export const resizeVideo = (inputPath, width, height) => {
  const outputPath = path.join(config.outputsDir, `resized-${Date.now()}.mp4`);
  
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .size(`${width}x${height}`)
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started resizing:', cmd))
      .on('end', () => {
        console.log('[FFmpeg] Resizing complete:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('[FFmpeg] Resizing error:', err.message);
        console.error('[FFmpeg] stderr:', stderr);
        const error = new Error(err.message);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      })
      .run();
  });
};

export const trimVideo = (inputPath, start, duration) => {
  const outputPath = path.join(config.outputsDir, `trimmed-${Date.now()}.mp4`);
  
  return new Promise((resolve, reject) => {
    const s = parseFloat(start) || 0;
    const d = parseFloat(duration);

    let command = ffmpeg(inputPath)
      .setStartTime(s);

    if (!isNaN(d)) {
      command = command.setDuration(d);
    }

    command
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started trimming:', cmd))
      .on('end', () => {
        console.log('[FFmpeg] Trimming complete:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('[FFmpeg] Trimming error:', err.message);
        console.error('[FFmpeg] stderr:', stderr);
        const error = new Error(err.message);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      })
      .run();
  });
};

export const applyFilter = (inputPath, filterName) => {
  const filterMap = {
    grayscale: 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3',
    blur: 'boxblur=5:1',
    sharpen: 'unsharp=5:5:1.0:5:5:0.0',
    mirror: 'hflip',
    flip: 'vflip',
    sepia: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131',
    vintage: 'curves=vintage',
    negative: 'negate'
  };

  const ffmpegFilter = filterMap[filterName] || filterName;
  const outputPath = path.join(config.outputsDir, `filtered-${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(ffmpegFilter)
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started filter:', cmd))
      .on('end', () => {
        console.log('[FFmpeg] Filter complete:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('[FFmpeg] Filter error:', err.message);
        console.error('[FFmpeg] stderr:', stderr);
        const error = new Error(err.message);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      })
      .run();
  });
};

export const generateThumbnail = (inputPath, timestamp = '00:00:01') => {
  const filename = `thumb-${Date.now()}.png`;
  
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [timestamp],
        filename: filename,
        folder: config.outputsDir,
        size: '320x240'
      })
      .on('end', () => resolve(path.join(config.outputsDir, filename)))
      .on('error', (err) => reject(err));
  });
};

export const watermarkVideo = (videoPath, watermarkPath) => {
  const outputPath = path.join(config.outputsDir, `watermarked-${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(watermarkPath)
      .complexFilter(['overlay=10:10'])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

export const concatVideos = async (files, transition = 'none', transitionDuration = 1) => {
  const outputPath = path.join(config.outputsDir, `production-master-${Date.now()}.mp4`);
  
  const getVideoDuration = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        resolve(err ? 0 : (metadata.format.duration || 0));
      });
    });
  };
  
  const hasAudio = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return resolve(false);
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        resolve(!!audioStream);
      });
    });
  };

  const [audioChecks, durations] = await Promise.all([
    Promise.all(files.map(f => hasAudio(f.path))),
    Promise.all(files.map(f => getVideoDuration(f.path)))
  ]);
  
  let filterParts = [];
  
  const xfadeMap = { 'crossfade': 'fade', 'fade': 'fade', 'wipeleft': 'wipeleft', 'wiperight': 'wiperight', 'slideup': 'slideup', 'slidedown': 'slidedown' };
  
  // NORMALIZE ALL INPUTS: 1920x1080, 30fps, yuv420p
  // This ensures that even mixed 720p/1080p or different formats stitch perfectly.
  
  // FORCE NO TRANSITIONS (EXACT CUTS) to eliminate audio bleeding/drift
  const forceNoTransitions = false;

  if (forceNoTransitions || transition === 'none' || files.length < 2) {
    let concatInputs = '';
    files.forEach((_, i) => {
      // Scale and pad to 1920x1080
      filterParts.push(`[${i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,setsar=1[v${i}]`);
      
      if (audioChecks[i]) {
        filterParts.push(`[${i}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a${i}]`);
      } else {
        filterParts.push(`anullsrc=channel_layout=stereo:sample_rate=44100:duration=${durations[i]}[a${i}]`);
      }
      concatInputs += `[v${i}][a${i}]`;
    });
    filterParts.push(`${concatInputs}concat=n=${files.length}:v=1:a=1[outv][outa]`);
  } else {
    // 2. Video Sequential transition chain (Duration Preserving)
    // We use sequential fade filters on each stream and then concat them.
    // This ensures Total Duration = Sum(Scene Durations).
    files.forEach((_, i) => {
      const dur = durations[i];
      const h_fade = transitionDuration / 2;
      
      // Build a filter that fades in at start and out at end
      let vFilters = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,setsar=1`;
      
      if (i > 0) vFilters += `,fade=t=in:st=0:d=${h_fade}`;
      if (i < files.length - 1) vFilters += `,fade=t=out:st=${dur - h_fade}:d=${h_fade}`;
      
      filterParts.push(`[${i}:v]${vFilters}[v${i}]`);
      
      let aFilters = `aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo`;
      if (!audioChecks[i]) {
        // Generate silence for the full duration of the clip
        filterParts.push(`anullsrc=channel_layout=stereo:sample_rate=44100:duration=${dur}[sa${i}]`);
        aFilters = `aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo`;
        if (i > 0) aFilters += `,afade=t=in:st=0:d=${h_fade}`;
        if (i < files.length - 1) aFilters += `,afade=t=out:st=${dur - h_fade}:d=${h_fade}`;
        filterParts.push(`[sa${i}]${aFilters}[a${i}]`);
      } else {
        if (i > 0) aFilters += `,afade=t=in:st=0:d=${h_fade}`;
        if (i < files.length - 1) aFilters += `,afade=t=out:st=${dur - h_fade}:d=${h_fade}`;
        filterParts.push(`[${i}:a]${aFilters}[a${i}]`);
      }
    });

    let sequentialInputs = '';
    files.forEach((_, i) => { sequentialInputs += `[v${i}][a${i}]`; });
    filterParts.push(`${sequentialInputs}concat=n=${files.length}:v=1:a=1[outv][outa]`);
  }

  console.log('[FFmpeg] Generated Filter Graph Parts:', filterParts.length);
  filterParts.forEach((p, i) => console.log(`  Part ${i}: ${p.slice(0, 100)}${p.length > 100 ? '...' : ''}`));

  return new Promise((resolve, reject) => {
    let command = ffmpeg();
    files.forEach(f => { command = command.input(f.path); });
    
    // No longer need to add anullsrc as an external input
    
    command
      .complexFilter(filterParts.join(';'))
      .outputOptions(['-map', '[outv]', '-map', '[outa]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart'])
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started Production Concat:', cmd))
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`[FFmpeg] Processing: ${progress.percent.toFixed(2)}% | Time: ${progress.timemark}`);
        } else {
          console.log(`[FFmpeg] Processing... | Time: ${progress.timemark}`);
        }
      })
      .on('end', () => {
        console.log('[FFmpeg] Production Concat complete:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('[FFmpeg] Concat error:', err.message);
        console.error('[FFmpeg] stderr:', stderr);
        const error = new Error(err.message);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      })
      .run();
  });
};

export const adjustSpeed = async (inputPath, targetDuration, inputSpeed) => {
  const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration || 0);
      });
    });
  };

  const originalDuration = await getVideoDuration(inputPath);
  let speed = targetDuration ? (originalDuration / targetDuration) : (inputSpeed || 1);
  speed = Math.max(0.25, Math.min(4, speed));

  const outputPath = path.join(config.outputsDir, `speed-${Date.now()}.mp4`);
  const buildAtempoFilter = (s) => {
    const filters = [];
    let cur = s;
    while (cur > 2.0) { filters.push('atempo=2.0'); cur /= 2.0; }
    while (cur < 0.5) { filters.push('atempo=0.5'); cur /= 0.5; }
    filters.push(`atempo=${cur.toFixed(4)}`);
    return filters.join(',');
  };

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(`setpts=PTS/${speed}`)
      .audioFilters(buildAtempoFilter(speed))
      .outputOptions(['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '192k'])
      .output(outputPath)
      .on('end', () => resolve({ outputPath, originalDuration, speed }))
      .on('error', (err) => reject(err))
      .run();
  });
};

export const applyZoom = async (inputPath, options) => {
  const getVideoInfo = (filePath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        const vs = metadata.streams.find(s => s.codec_type === 'video');
        let fps = 30;
        if (vs?.r_frame_rate) {
          const p = vs.r_frame_rate.split('/');
          fps = p.length === 2 ? parseInt(p[0]) / parseInt(p[1]) : parseFloat(p[0]);
        }
        resolve({ duration: metadata.format.duration || 0, width: vs?.width || 1920, height: vs?.height || 1080, fps: Math.round(fps) || 30 });
      });
    });
  };

  const vi = await getVideoInfo(inputPath);
  const { type = 'in', startZoom = options.type === 'in' ? 1 : 1.5, endZoom = options.type === 'in' ? 1.5 : 1, centerX = 0.5, centerY = 0.5 } = options;
  const outW = options.width || vi.width;
  const outH = options.height || vi.height;
  const outputPath = path.join(config.outputsDir, `zoom-${Date.now()}.mp4`);
  
  const totalFrames = Math.ceil(vi.duration * vi.fps);
  const upscale = 8;
  const upW = Math.round(outW * upscale);
  const upH = Math.round(outH * upscale);
  
  const filter = [
    `scale=${upW}:${upH}:flags=lanczos`,
    `zoompan=z='${startZoom}+(${endZoom}-${startZoom})*(on/${totalFrames})':x='(iw-iw/zoom)*${centerX}':y='(ih-ih/zoom)*${centerY}':d=1:s=${upW}x${upH}:fps=${vi.fps}`,
    `scale=${outW}:${outH}:flags=lanczos`
  ].join(',');

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(filter)
      .outputOptions(['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '192k', '-pix_fmt', 'yuv420p'])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

export const mergeAudioVideo = async (videoPath, audioPath, audioStartOffset = 0) => {
  const outputPath = path.join(config.outputsDir, `merged-${Date.now()}.mp4`);
  
  const getDuration = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        resolve(err ? 0 : (metadata.format.duration || 0));
      });
    });
  };

  const audioDuration = await getDuration(audioPath);
  console.log(`[FFmpeg] Merging Video + Audio. Target (Audio) Duration: ${audioDuration}s | Audio Offset: ${audioStartOffset}s`);

  return new Promise((resolve, reject) => {
    let command = ffmpeg(videoPath)
      .input(audioPath);

    // If offset is provided (e.g. 0.4s), we delay the audio
    if (audioStartOffset > 0) {
      const ms = Math.round(audioStartOffset * 1000);
      command = command.audioFilters(`adelay=${ms}|${ms}`);
    }

    command
      // Map video from first input, audio from second
      .outputOptions([
        '-map 0:v:0', 
        '-map 1:a:0', 
        '-c:v libx264', // Re-encode video to ensure filter/sync works 
        '-preset', 'ultrafast',
        '-c:a aac', 
        '-b:a 192k',
        '-shortest' 
      ])
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started Merging:', cmd))
      .on('end', () => {
        console.log('[FFmpeg] Merging complete:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('[FFmpeg] Merging error:', err.message);
        const error = new Error(err.message);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      })
      .run();
  });
};

export const lightLeakTransition = async (files, transitionDuration = 0.8) => {
  const outputPath = path.join(config.outputsDir, `light-leak-${Date.now()}.mp4`);
  
  if (files.length < 3) throw new Error('Light Leak requires 3 files: Clip A, Clip B, and the Overlay Asset.');

  const getVideoDuration = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        resolve(err ? 0 : (metadata.format.duration || 0));
      });
    });
  };

  const [dur1, dur2, durOverlay] = await Promise.all([
    getVideoDuration(files[0].path),
    getVideoDuration(files[1].path),
    getVideoDuration(files[2].path)
  ]);

  // Timing calculations
  const safeTransDur = Math.min(transitionDuration, dur1 * 0.8, dur2 * 0.8, 2.5) || 1.1;
  const overlayOffset = dur1 - safeTransDur;
  const overlaySpeed = durOverlay / safeTransDur;

  const xfadeDuration = safeTransDur * 0.45; 
  const xfadeOffset = overlayOffset + (safeTransDur * 0.35);

  console.log(`[FFmpeg] Light Leak: dur1=${dur1}, trans=${safeTransDur}, xfadeOffset=${xfadeOffset}`);

  const filterParts = [
    `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v0]`,
    `[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v1]`,
    `[2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setpts=PTS/${overlaySpeed}[flare_scaled]`,
    `[flare_scaled]trim=end=${safeTransDur},setpts=PTS-STARTPTS[flare_trimmed]`,
    `[flare_trimmed]fade=t=out:st=${safeTransDur * 0.8}:d=${safeTransDur * 0.2}[flare_faded]`,
    `[flare_faded]tpad=start_duration=${overlayOffset}:color=black,setpts=PTS+${overlayOffset}/TB,format=yuv420p[flare_delayed]`,
    `[v0][v1]xfade=transition=fade:duration=${xfadeDuration}:offset=${xfadeOffset},format=yuv420p[base_vid]`,
    `[base_vid][flare_delayed]blend=all_mode=lighten:shortest=0,format=yuv420p[outv]`,
    `[0:a][1:a]acrossfade=d=${xfadeDuration}[outa]`
  ];

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(files[0].path)
      .input(files[1].path)
      .input(files[2].path)
      .complexFilter(filterParts.join(';'))
      .outputOptions(['-map', '[outv]', '-map', '[outa]', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac'])
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started Light Leak Transition:', cmd))
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(err.message)))
      .run();
  });
};

export const batchLightLeakTransition = async (files, transitionDuration = 0.8) => {
  const outputPath = path.join(config.outputsDir, `batch-light-leak-${Date.now()}.mp4`);
  
  // Last file is the overlay
  const sourceFiles = files.slice(0, -1);
  const overlayFile = files[files.length - 1];

  if (sourceFiles.length < 2) throw new Error('At least 2 source clips + 1 overlay required');

  console.log(`[FFmpeg] Batch Light Leak: Processing ${sourceFiles.length} clips with overlay`);

  const getInfo = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return resolve({ duration: 0, fps: 30, hasAudio: false });
        const vs = metadata.streams.find(s => s.codec_type === 'video');
        const as = metadata.streams.find(s => s.codec_type === 'audio');
        let fps = 30;
        if (vs && vs.r_frame_rate) {
          const [num, den] = vs.r_frame_rate.split('/').map(Number);
          if (num && den) fps = num / den;
        }
        resolve({ duration: metadata.format.duration || 0, fps, hasAudio: !!as });
      });
    });
  };

  const infos = await Promise.all(sourceFiles.map(f => getInfo(f.path)));
  let overlayInfo = await getInfo(overlayFile.path);

  // Safety check: if overlay duration is 0 (image or corrupted), default to a safe value to avoid division by zero
  if (!overlayInfo.duration || overlayInfo.duration < 0.1) {
    console.warn(`[FFmpeg] Warning: Overlay duration is ${overlayInfo.duration}s. Forcing safety duration of 10s to prevent crash.`);
    overlayInfo.duration = 10;
  }

  console.log('[FFmpeg] Clip durations:', infos.map((info, i) => `Clip ${i}: ${info.duration.toFixed(2)}s`));

  const filterParts = [];
  const overlayInputIndex = files.length - 1;

  // 1. Normalize all source clips
  sourceFiles.forEach((_, i) => {
    filterParts.push(`[${i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[norm_v${i}]`);
    filterParts.push(`[${i}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[norm_a${i}]`);
  });

  // 1.5. Split the overlay into N-1 copies (one for each transition)
  const numTransitions = sourceFiles.length - 1;
  const overlayHasAudio = overlayInfo.hasAudio;

  if (numTransitions > 1) {
    // Video split
    const splitOutputs = Array.from({ length: numTransitions }, (_, i) => `[overlay_copy${i}]`).join('');
    filterParts.push(`[${overlayInputIndex}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,split=${numTransitions}${splitOutputs}`);
    
    // Audio split (if exists)
    if (overlayHasAudio) {
      const splitAudOutputs = Array.from({ length: numTransitions }, (_, i) => `[overlay_aud_copy${i}]`).join('');
      filterParts.push(`[${overlayInputIndex}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,asplit=${numTransitions}${splitAudOutputs}`);
    }
  } else {
    // Only one transition
    filterParts.push(`[${overlayInputIndex}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p[overlay_copy0]`);
    if (overlayHasAudio) {
      filterParts.push(`[${overlayInputIndex}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[overlay_aud_copy0]`);
    }
  }

  // 2. Build Sequential XFade and Overlay Chain
  let currentVid = `norm_v0`;
  let currentAud = `norm_a0`;
  let cumulativeTime = 0;

  for (let i = 0; i < sourceFiles.length - 1; i++) {
    const dur1 = infos[i].duration;
    const dur2 = infos[i+1].duration;
    const safeTransDur = Math.min(transitionDuration, dur1 * 0.4, dur2 * 0.4, 1.5) || 0.8;
    
    // Calculate the offset where the xfade should occur
    // For the first transition (i=0), it's at the end of clip 0
    // For subsequent transitions, it's cumulative time + duration of current segment
    const xfadeDuration = safeTransDur * 0.45;
    let xfadeOffset;
    
    if (i === 0) {
      // First transition: happens at the end of the first clip
      xfadeOffset = dur1 - (safeTransDur * 0.5);
    } else {
      // Subsequent transitions: cumulative time + current segment duration
      xfadeOffset = cumulativeTime + dur1 - (safeTransDur * 0.5);
    }
    
    const nextVid = `xfade_v${i}`;
    const nextAud = `xfade_a${i}`;

    console.log(`[FFmpeg] Transition ${i}: offset=${xfadeOffset.toFixed(2)}s, duration=${xfadeDuration.toFixed(2)}s, transDur=${safeTransDur.toFixed(2)}s`);

    // Apply XFade
    filterParts.push(`[${currentVid}][norm_v${i+1}]xfade=transition=fade:duration=${xfadeDuration}:offset=${xfadeOffset},format=yuv420p[${nextVid}]`);
    filterParts.push(`[${currentAud}][norm_a${i+1}]acrossfade=d=${xfadeDuration}[${nextAud}]`);

    // Prepare Overlay for this junction (use the split copy instead of original input)
    const overlaySpeed = overlayInfo.duration / safeTransDur;
    const flareStartupDelay = Math.max(0, xfadeOffset - (safeTransDur * 0.1)); // Start slightly before peak
    
    filterParts.push(`[overlay_copy${i}]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setpts=PTS/${overlaySpeed}[flare_s${i}]`);
    filterParts.push(`[flare_s${i}]trim=end=${safeTransDur},setpts=PTS-STARTPTS[flare_t${i}]`);
    filterParts.push(`[flare_t${i}]tpad=start_duration=${flareStartupDelay}:color=black,setpts=PTS+${flareStartupDelay}/TB[flare_d${i}]`);
    
    // Blend with previous cumulative video
    const blendedVid = `blend_v${i}`;
    filterParts.push(`[${nextVid}][flare_d${i}]blend=all_mode=lighten:shortest=0,format=yuv420p[${blendedVid}]`);

    // Audio: If overlay has audio, process and mix it
    if (overlayHasAudio) {
      const atempoVal = overlaySpeed;
      
      const buildAtempo = (s) => {
        const filters = [];
        let cur = s;
        while (cur > 2.0) { filters.push('atempo=2.0'); cur /= 2.0; }
        while (cur < 0.5) { filters.push('atempo=0.5'); cur /= 0.5; }
        filters.push(`atempo=${cur.toFixed(4)}`);
        return filters.join(',');
      };

      const transAud = `trans_aud${i}`;
      const delayedAud = `delayed_aud${i}`;
      const mixedAud = `mixed_aud${i}`;

      filterParts.push(`[overlay_aud_copy${i}]${buildAtempo(atempoVal)},atrim=end=${safeTransDur}[${transAud}]`);
      // Use adelay to offset to exactly flareStartupDelay (converted to ms)
      const delayMs = Math.round(flareStartupDelay * 1000);
      filterParts.push(`[${transAud}]adelay=${delayMs}|${delayMs}[${delayedAud}]`);
      
      // Mix with current segment audio
      filterParts.push(`[${nextAud}][${delayedAud}]amix=inputs=2:duration=first[${mixedAud}]`);
      currentAud = mixedAud;
    } else {
      currentAud = nextAud;
    }

    currentVid = blendedVid;
    
    // Update cumulative time: add the duration of the segment minus the overlap
    cumulativeTime += (dur1 - xfadeDuration);
  }

  console.log(`[FFmpeg] Final output streams: video=[${currentVid}], audio=[${currentAud}]`);
  console.log(`[FFmpeg] Filter chain has ${filterParts.length} parts`);

  return new Promise((resolve, reject) => {
    let command = ffmpeg();
    files.forEach(f => { command = command.input(f.path); });
    
    command
      .complexFilter(filterParts.join(';'))
      .outputOptions([
        '-map', `[${currentVid}]`,
        '-map', `[${currentAud}]`,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac'
      ])
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started Batch Light Leak:', cmd))
      .on('end', () => {
        console.log('[FFmpeg] Batch Light Leak complete:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('[FFmpeg] Batch Light Leak error:', err.message);
        console.error('[FFmpeg] stderr:', stderr);
        reject(new Error(err.message));
      })
      .run();
  });
};

export const zoomInTransition = async (files, transitionDuration = 1.0) => {
  const outputPath = path.join(config.outputsDir, `zoom-transition-${Date.now()}.mp4`);
  
  if (files.length < 2) throw new Error('Zoom In Transition requires 2 files: Clip A and Clip B.');

  const getVideoDuration = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        resolve(err ? 0 : (metadata.format.duration || 0));
      });
    });
  };

  const [dur1, dur2] = await Promise.all([
    getVideoDuration(files[0].path),
    getVideoDuration(files[1].path)
  ]);

  const safeTransDur = Math.min(transitionDuration, dur1 * 0.8, dur2 * 0.8, 3.0) || 1.0;
  const offset = dur1 - safeTransDur;

  console.log(`[FFmpeg] Zoom In Transition: dur1=${dur1}, dur2=${dur2}, trans=${safeTransDur}, offset=${offset}`);

  const filterParts = [
    // 1. Normalize both inputs to 1920x1080, 30fps
    `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v0]`,
    `[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v1]`,
    
    // 2. Apply zoomin xfade transition
    `[v0][v1]xfade=transition=zoomin:duration=${safeTransDur}:offset=${offset},format=yuv420p[outv]`,
    
    // 3. Audio crossfade
    `[0:a][1:a]acrossfade=d=${safeTransDur}:curve1=exp:curve2=exp[outa]`
  ];

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(files[0].path)
      .input(files[1].path)
      .complexFilter(filterParts.join(';'))
      .outputOptions([
        '-map', '[outv]', 
        '-map', '[outa]', 
        '-c:v', 'libx264', 
        '-preset', 'ultrafast', 
        '-crf', '20', 
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac'
      ])
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started Zoom In Transition:', cmd))
      .on('end', () => resolve(outputPath))
      .on('error', (err, stdout, stderr) => {
        console.error('[FFmpeg] Zoom In Transition Error:', err.message);
        reject(new Error(err.message));
      })
      .run();
  });
};

export const blurCrossfade = async (files, transitionDuration = 1.0) => {
  const outputPath = path.join(config.outputsDir, `blur-crossfade-${Date.now()}.mp4`);
  
  if (files.length < 2) throw new Error('Blur Crossfade requires 2 files: Clip A and Clip B.');

  const getVideoDuration = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        resolve(err ? 0 : (metadata.format.duration || 0));
      });
    });
  };

  const [dur1, dur2] = await Promise.all([
    getVideoDuration(files[0].path),
    getVideoDuration(files[1].path)
  ]);

  const safeTransDur = Math.min(transitionDuration, dur1 * 0.8, dur2 * 0.8, 3.0) || 1.0;
  const offset = dur1 - safeTransDur;

  const filterParts = [
    // Normalize
    `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v0]`,
    `[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v1]`,
    
    // Optimized Blur Crossfade logic:
    // Using the built-in 'hblur' transition is significantly more stable and performant.
    `[v0][v1]xfade=transition=hblur:duration=${safeTransDur}:offset=${offset},format=yuv420p[outv]`,
    `[0:a][1:a]acrossfade=d=${safeTransDur}[outa]`
  ];

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(files[0].path)
      .input(files[1].path)
      .complexFilter(filterParts.join(';'))
      .outputOptions(['-map', '[outv]', '-map', '[outa]', '-c:v', 'libx264', '-preset', 'ultrafast'])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

export const zoomOutTransitionLogic = async (files, transitionDuration = 1.0) => {
  const outputPath = path.join(config.outputsDir, `zoom-out-${Date.now()}.mp4`);
  
  if (files.length < 2) throw new Error('Zoom Out requires 2 files: Clip A and Clip B.');

  const getVideoInfo = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return resolve({ duration: 0, width: 1920, height: 1080 });
        const vs = metadata.streams.find(s => s.codec_type === 'video');
        resolve({ 
          duration: metadata.format.duration || 0, 
          width: vs?.width || 1920, 
          height: vs?.height || 1080 
        });
      });
    });
  };

  const [dur1, dur2] = await Promise.all([
    getVideoInfo(files[0].path).then(i => i.duration),
    getVideoInfo(files[1].path).then(i => i.duration)
  ]);

  const safeTransDur = Math.min(transitionDuration, dur1 * 0.8, dur2 * 0.8, 3.0) || 1.0;
  const offset = dur1 - safeTransDur;
  const totalFramesB = Math.ceil(dur2 * 30);
  const transFrames = Math.ceil(safeTransDur * 30);

  console.log(`[FFmpeg] Manual Zoom Out: dur1=${dur1}, trans=${safeTransDur}, offset=${offset}`);

  const filterParts = [
    // 1. Normalize Clip A
    `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v0]`,
    
    // 2. Optimized Manual Zoom Out for Clip B
    // We scale by 1.2x at start and smoothly move to 1.0x over the transition period.
    // Using zoompan with d=1 and s=1920x1080 is the standard way to do this.
    `[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1[v1_pre]`,
    `[v1_pre]zoompan=z='1.2-0.2*min(on/(${safeTransDur}*30),1)':x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':d=1:s=1920x1080:fps=30,format=yuv420p[v1]`,
    
    // 3. Combine with standard fade
    `[v0][v1]xfade=transition=fade:duration=${safeTransDur}:offset=${offset},format=yuv420p[outv]`,
    `[0:a][1:a]acrossfade=d=${safeTransDur}[outa]`
  ];

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(files[0].path)
      .input(files[1].path)
      .complexFilter(filterParts.join(';'))
      .outputOptions(['-map', '[outv]', '-map', '[outa]', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '20', '-pix_fmt', 'yuv420p'])
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started Manual Zoom Out:', cmd))
      .on('end', () => resolve(outputPath))
      .on('error', (err, stdout, stderr) => {
        console.error('[FFmpeg] Manual Zoom Out Error:', err.message);
        reject(new Error(err.message));
      })
      .run();
  });
};

export const radialTransition = async (files, transitionDuration = 1.0) => {
  const outputPath = path.join(config.outputsDir, `radial-${Date.now()}.mp4`);
  const dur1 = await new Promise(r => ffmpeg.ffprobe(files[0].path, (e, m) => r(m?.format?.duration || 0)));
  const safeDur = Math.min(transitionDuration, dur1 * 0.8, 3.0);
  const offset = dur1 - safeDur;

  const filter = [
    `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v0]`,
    `[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v1]`,
    `[v0][v1]xfade=transition=radial:duration=${safeDur}:offset=${offset},format=yuv420p[outv]`,
    `[0:a][1:a]acrossfade=d=${safeDur}[outa]`
  ];

  return new Promise((r, j) => {
    ffmpeg().input(files[0].path).input(files[1].path).complexFilter(filter.join(';'))
      .outputOptions(['-map', '[outv]', '-map', '[outa]', '-c:v', 'libx264', '-preset', 'ultrafast'])
      .output(outputPath).on('end', () => r(outputPath)).on('error', j).run();
  });
};

export const circleTransition = async (files, transitionDuration = 1.0) => {
  const outputPath = path.join(config.outputsDir, `circle-${Date.now()}.mp4`);
  const dur1 = await new Promise(r => ffmpeg.ffprobe(files[0].path, (e, m) => r(m?.format?.duration || 0)));
  const safeDur = Math.min(transitionDuration, dur1 * 0.8, 3.0);
  const offset = dur1 - safeDur;

  const filter = [
    `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v0]`,
    `[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1,format=yuv420p[v1]`,
    `[v0][v1]xfade=transition=circleclose:duration=${safeDur}:offset=${offset},format=yuv420p[outv]`,
    `[0:a][1:a]acrossfade=d=${safeDur}[outa]`
  ];

  return new Promise((r, j) => {
    ffmpeg().input(files[0].path).input(files[1].path).complexFilter(filter.join(';'))
      .outputOptions(['-map', '[outv]', '-map', '[outa]', '-c:v', 'libx264', '-preset', 'ultrafast'])
      .output(outputPath).on('end', () => r(outputPath)).on('error', j).run();
  });
};

export const kenBurns = async (imagePath, audioPath, zoomType = 'in') => {
  const outputPath = path.join(config.outputsDir, `ken-burns-${Date.now()}.mp4`);
  
  const getDuration = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        resolve(err ? 0 : (metadata.format.duration || 0));
      });
    });
  };

  const audioDuration = await getDuration(audioPath);
  if (audioDuration === 0) throw new Error('Could not determine audio duration');
  
  const fps = 30;
  const totalFrames = Math.ceil(audioDuration * fps);
  
  // Stability fix: Scale to 4K first, then zoompan at 4K, then scale back down to 1080p
  // This eliminates the 'shaking' caused by integer rounding at lower resolutions.
  const upW = 3840;
  const upH = 2160;
  
  let startZoom, endZoom, zoomFilter;
  
  if (zoomType === 'pan') {
    // Pan: subtle zoom with lateral movement
    startZoom = 1.2;
    endZoom = 1.2;
    zoomFilter = `zoompan=z=1.2:x='(on/${totalFrames})*(iw-iw/zoom)':y='(on/${totalFrames})*(ih-ih/zoom)':d=1:s=${upW}x${upH}:fps=${fps}`;
  } else {
    // Standard zoom in/out
    startZoom = zoomType === 'in' ? 1.0 : 1.3;
    endZoom = zoomType === 'in' ? 1.3 : 1.0;
    zoomFilter = `zoompan=z='${startZoom}+(${endZoom}-${startZoom})*(on/${totalFrames})':x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':d=1:s=${upW}x${upH}:fps=${fps}`;
  }

  console.log(`[FFmpeg] Ken Burns (Anti-Jitter 4K): dur=${audioDuration}s, frames=${totalFrames}, zoom=${startZoom}->${endZoom}`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .inputOptions(['-loop 1'])
      .input(audioPath)
      .complexFilter([
        // Step 1: Scale to 4K with lanczos for max detail
        // Step 2: Apply zoompan at 4K resolution
        // Step 3: Downscale back to 1080p for public viewing
        `[0:v]scale=${upW}:${upH}:force_original_aspect_ratio=increase,crop=${upW}:${upH},setsar=1,${zoomFilter},scale=1920:1080:flags=lanczos,format=yuv420p[v]`,
        `[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a]`
      ])
      .outputOptions([
        '-map', '[v]',
        '-map', '[a]',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '18',
        '-t', audioDuration,
        '-pix_fmt', 'yuv420p'
      ])
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started Anti-Jitter Ken Burns:', cmd))
      .on('end', () => resolve(outputPath))
      .on('error', (err, stdout, stderr) => {
        console.error('[FFmpeg] Ken Burns error:', err.message);
        reject(new Error(err.message));
      })
      .run();
  });
};

export const videoKenBurns = async (videoPath, zoomType = 'in', aspectRatio = 'landscape') => {
  const outputPath = path.join(config.outputsDir, `video-ken-burns-${Date.now()}.mp4`);
  
  const getInfo = (filePath) => {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return resolve({ duration: 0, width: 1920, height: 1080, fps: 30 });
        const vs = metadata.streams.find(s => s.codec_type === 'video');
        
        // Parse FPS (e.g., "30/1" or "24000/1001")
        let fps = 30;
        if (vs && vs.r_frame_rate) {
          const [num, den] = vs.r_frame_rate.split('/').map(Number);
          if (num && den) fps = num / den;
        }

        resolve({ 
          duration: metadata.format.duration || 0, 
          width: vs?.width || 1920, 
          height: vs?.height || 1080,
          fps
        });
      });
    });
  };

  const info = await getInfo(videoPath);
  if (info.duration === 0) throw new Error('Could not determine video duration');
  
  const fps = info.fps;
  const totalFrames = Math.ceil(info.duration * fps);
  const startZoom = zoomType === 'in' ? 1.0 : (zoomType === 'out' ? 1.2 : 1.1);
  const endZoom = zoomType === 'in' ? 1.2 : (zoomType === 'out' ? 1.0 : 1.1);

  // Anti-Jitter Resolution Config
  const isPortrait = aspectRatio === 'portrait';
  const upW = isPortrait ? 2160 : 3840;
  const upH = isPortrait ? 3840 : 2160;
  const finalW = isPortrait ? 1080 : 1920;
  const finalH = isPortrait ? 1920 : 1080;

  let zoomFilter;
  if (zoomType === 'pan') {
    // Pan from top-left to bottom-right
    zoomFilter = `zoompan=z=1.2:x='(on/${totalFrames})*(iw-iw/zoom)':y='(on/${totalFrames})*(ih-ih/zoom)':d=1:s=${upW}x${upH}:fps=${fps}`;
  } else {
    // Standard Zoom In/Out
    zoomFilter = `zoompan=z='${startZoom}+(${endZoom}-${startZoom})*(on/${totalFrames})':x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':d=1:s=${upW}x${upH}:fps=${fps}`;
  }

  console.log(`[FFmpeg] Video Ken Burns (${zoomType}, ${aspectRatio}): dur=${info.duration}s, zoom=${startZoom}->${endZoom}`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .complexFilter([
        `[0:v]scale=${upW}:${upH}:force_original_aspect_ratio=increase,crop=${upW}:${upH},setsar=1,${zoomFilter},scale=${finalW}:${finalH}:flags=lanczos,format=yuv420p[v]`
      ])
      .outputOptions([
        '-map', '[v]',
        '-map', '0:a?', // Map audio if it exists
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'copy'
      ])
      .output(outputPath)
      .on('start', (cmd) => console.log('[FFmpeg] Started Video Ken Burns:', cmd))
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error('[FFmpeg] Video Ken Burns error:', err.message);
        reject(new Error(err.message));
      })
      .run();
  });
};
