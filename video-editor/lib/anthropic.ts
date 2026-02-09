import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API) {
  throw new Error("Missing ANTHROPIC_API environment variable");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API,
});
