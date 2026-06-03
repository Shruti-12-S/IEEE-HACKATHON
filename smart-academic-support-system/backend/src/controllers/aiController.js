import { asyncHandler } from "../utils/asyncHandler.js";
import { askAiText, getAiProvider } from "../utils/aiService.js";

export const chat = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: "Message is required" });

  const context = history
    .slice(-6)
    .map((item) => `${item.role === "assistant" ? "Assistant" : "Student"}: ${item.content}`)
    .join("\n");
  const prompt = `${context ? `${context}\n\n` : ""}Student: ${message}`;
  const result = await askAiText(prompt);

  res.json({
    provider: result.provider,
    reply: result.text
  });
});

export const status = asyncHandler(async (req, res) => {
  res.json({
    provider: getAiProvider(),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    fallbackAvailable: true
  });
});
