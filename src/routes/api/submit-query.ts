import { createFileRoute } from "@tanstack/react-router";

const WEBHOOK_URL =
  "https://n8n.srv1106977.hstgr.cloud/webhook/31cd9d1b-95ea-4383-b8cc-2366eb936b2a";

export const Route = createFileRoute("/api/submit-query")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.text();
          const res = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          const text = await res.text();
          return new Response(text || JSON.stringify({ ok: res.ok }), {
            status: res.status,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});