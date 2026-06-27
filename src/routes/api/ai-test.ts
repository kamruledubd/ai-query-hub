import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider, getLovableAiGatewayRunId, getLovableAiGatewayResponseHeaders } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/ai-test")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });
        }

        try {
          const initialRunId = getLovableAiGatewayRunId(request);
          const gateway = createLovableAiGatewayProvider(key, initialRunId);
          const result = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            system: "You are a helpful AI assistant. Give a short, friendly greeting.",
            prompt: "Say hello and confirm the AI gateway is working. Keep it under 50 words.",
          });

          return Response.json(
            { ok: true, response: result.text },
            { headers: getLovableAiGatewayResponseHeaders(result.response.headers) },
          );
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
