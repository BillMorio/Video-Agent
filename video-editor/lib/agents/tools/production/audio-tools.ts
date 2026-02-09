import { FFMPEG_SERVER_URL } from "./broll-tools";

export interface TrimAudioArgs {
  audioUrl: string;
  start: string;
  duration: number;
}

export interface MergeAudioVideoArgs {
  videoUrl: string;
  audioUrl: string;
}

/**
 * Trims an audio segment from a source URL using the FFmpeg server.
 */
export async function trim_audio_segment(args: TrimAudioArgs) {
  console.log(`[AudioTool] Trimming audio: ${args.audioUrl} from ${args.start} for ${args.duration}s`);

  // We need to download the remote file first and send as FormData 
  // because the FFmpeg server /api/audio-trim expects a file upload.
  const audioBlob = await fetch(args.audioUrl).then(res => res.blob());
  const formData = new FormData();
  formData.append("file", audioBlob, "input.mp3");
  formData.append("start", args.start);
  formData.append("duration", args.duration.toString());

  const response = await fetch(`${FFMPEG_SERVER_URL}/api/audio-trim`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Audio trimming failed");

  return {
    success: true,
    audioUrl: `${FFMPEG_SERVER_URL}${data.outputFile}`,
    publicUrl: data.publicUrl
  };
}

/**
 * Semantic wrapper for trim_audio_segment specifically for master audio.
 */
export async function trim_master_audio(args: TrimAudioArgs) {
    return trim_audio_segment(args);
}

/**
 * Merges a video stream with an audio stream using the FFmpeg server.
 * Prioritizes the audio duration.
 */
export async function merge_audio_video(args: MergeAudioVideoArgs) {
  console.log(`[AudioTool] Merging Video (${args.videoUrl}) with Audio (${args.audioUrl})`);

  // Download both files to send as multipart/form-data
  const [videoBlob, audioBlob] = await Promise.all([
    fetch(args.videoUrl).then(res => res.blob()),
    fetch(args.audioUrl).then(res => res.blob())
  ]);

  const formData = new FormData();
  formData.append("video", videoBlob, "video.mp4");
  formData.append("audio", audioBlob, "audio.mp3");

  const response = await fetch(`${FFMPEG_SERVER_URL}/api/merge`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Merging failed");

  return {
    success: true,
    videoUrl: `${FFMPEG_SERVER_URL}${data.outputFile}`,
    publicUrl: data.publicUrl
  };
}
