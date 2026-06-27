import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const GenerateAIResponseInput = z.object({
  query: z.string().min(1).max(2000),
});

export const generateAIResponse = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateAIResponseInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const result = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system:
        "You are a helpful AI knowledge assistant. Answer the user's query concisely and accurately. Keep responses under 200 words.",
      prompt: data.query,
    });

    return { response: result.text };
  });
