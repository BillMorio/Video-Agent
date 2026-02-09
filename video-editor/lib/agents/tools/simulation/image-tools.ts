import { waitForProcessing } from "./definitions";

export const generate_sdxl_visual = async (args: { seconds?: number }) => {
  const delay = args.seconds || 6;
  console.log(`[Simulation] Generating SDXL Image... (${delay}s)`);
  await waitForProcessing(delay);
  return { status: "success", imageUrl: "https://simulated.sdxl.io/image.png" };
};

export const apply_text_branding = async (args: { seconds?: number }) => {
  const delay = args.seconds || 2;
  console.log(`[Simulation] Applying Branding... (${delay}s)`);
  await waitForProcessing(delay);
  return { status: "success", brandedUrl: "https://simulated.output/branded.png" };
};
