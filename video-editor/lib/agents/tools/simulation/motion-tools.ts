import { waitForProcessing } from "./definitions";

export const render_motion_sequence = async (args: { seconds?: number }) => {
  const delay = args.seconds || 10;
  console.log(`[Simulation] Rendering Motion Graphic... (${delay}s)`);
  await waitForProcessing(delay);
  return { status: "success", renderId: "render_xyz123" };
};

export const composite_ffmpeg_layer = async (args: { seconds?: number }) => {
  const delay = args.seconds || 5;
  console.log(`[Simulation] Compositing with FFmpeg... (${delay}s)`);
  await waitForProcessing(delay);
  return { status: "success", finalUrl: "https://simulated.render/final.mp4" };
};
