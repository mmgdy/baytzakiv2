import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are ARIA, the AI smart home expert for Baytzaki — Egypt's leading smart home store.

About Baytzaki:
- Sells: SONOFF, TP-Link Tapo, EZVIZ, Govee, Fibaro, HDL, LEZN, Aqara, Hikvision, Commax, Akuvox, Tuya, Shelly, Amazon Echo, Google Nest
- All prices in EGP (Egyptian Pounds)
- Cash on Delivery nationwide
- Every product has Arabic installation tutorials on YouTube
- WhatsApp: 01098327626 | Ships all Egypt
- Categories: Smart Switches, Cameras, Locks, Video Intercom, Staircase Lighting, Curtains, Plugs, Lighting, Climate, Sensors

Your personality: Friendly, knowledgeable, concise. Egyptian-market aware.
Answer in the same language the user writes (Arabic or English).
Keep answers under 250 words. Give specific product recommendations with EGP prices when possible.`;

// ── OpenAI Client ──────────────────────────────────────────────
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error("No OPENAI_API_KEY");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ── Groq (OpenAI-compatible) ───────────────────────────────────
async function groqChat(
  messages: { role: string; content: string }[]
): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error("No GROQ_API_KEY");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 800,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function POST(req: NextRequest) {
  const { message, history = [] } = await req.json();
  if (!message?.trim()) return new Response("Bad request", { status: 400 });

  const enc = new TextEncoder();
  const messages = [
    ...history.map((h: { role: string; content: string }) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user" as const, content: message },
  ];

  // ── Try OpenAI GPT-4o streaming ────────────────────────────
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = getOpenAIClient();
      const stream = new ReadableStream({
        async start(ctrl) {
          ctrl.enqueue(
            enc.encode(
              `data: ${JSON.stringify({ type: "provider", provider: "GPT-4o" })}\n\n`
            )
          );
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            max_tokens: 800,
            stream: true,
          });
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              ctrl.enqueue(
                enc.encode(
                  `data: ${JSON.stringify({ type: "text", text })}\n\n`
                )
              );
            }
          }
          ctrl.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (err) {
      console.warn("OpenAI failed, trying Groq:", err);
    }
  }

  // ── Fallback: Groq Llama 3.3 70B ──────────────────────────
  try {
    const text = await groqChat(messages);
    const stream = new ReadableStream({
      start(ctrl) {
        ctrl.enqueue(
          enc.encode(
            `data: ${JSON.stringify({ type: "provider", provider: "Groq Llama 3.3" })}\n\n`
          )
        );
        // Simulate streaming word by word
        const words = text.split(" ");
        let i = 0;
        const iv = setInterval(() => {
          if (i >= words.length) {
            clearInterval(iv);
            ctrl.close();
            return;
          }
          const chunk = words.slice(i, i + 4).join(" ") + (i + 4 < words.length ? " " : "");
          ctrl.enqueue(
            enc.encode(`data: ${JSON.stringify({ type: "text", text: chunk })}\n\n`)
          );
          i += 4;
        }, 20);
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response(
      `data: ${JSON.stringify({ type: "text", text: "Sorry, AI is temporarily unavailable. Please WhatsApp us at 01098327626." })}\n\n`,
      { headers: { "Content-Type": "text/event-stream" } }
    );
  }
}
