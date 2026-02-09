import { waitForProcessing } from "./definitions";

export const search_pexels_library = async (args: { seconds?: number }) => {
  const delay = args.seconds || 4;
  console.log(`[Simulation] Searching Pexels... (${delay}s)`);
  await waitForProcessing(delay);
  return { status: "success", clips: ["clip_1", "clip_2"] };
};

export const trim_stock_footage = async (args: { seconds?: number }) => {
  const delay = args.seconds || 3;
  console.log(`[Simulation] Trimming footage... (${delay}s)`);
  await waitForProcessing(delay);
  return { status: "success", trimmedUrl: "https://simulated.pexels.com/trimmed.mp4" };
};
