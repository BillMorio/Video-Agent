import { waitForProcessing } from "./definitions";

export const trim_audio_segment = async (args: { seconds?: number }) => {
  const delay = args.seconds || 3;
  console.log(`[Simulation] Trimming audio segment... (${delay}s)`);
  await waitForProcessing(delay);
  return { status: "success", audioSegmentId: "trimmed_segment_v1" };
};

export const generate_avatar_lipsync = async (args: { seconds?: number }) => {
  const delay = args.seconds || 8;
  console.log(`[Simulation] Generating Lip-sync... (${delay}s)`);
  await waitForProcessing(delay);
  return { status: "success", videoUrl: "https://simulated.heygen.com/output.mp4" };
};
