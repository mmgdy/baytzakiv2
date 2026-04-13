import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PRODUCTS } from "@/lib/store-products";

export const runtime = "nodejs";

const PROMPT_TEMPLATE = (needs: string, catalog: string) => `You are ARIA, Baytzaki's smart home AI expert for Egypt. 

Customer request: "${needs}"

Available products (sample from catalog):
${catalog}

Respond ONLY with valid JSON — no markdown, no code blocks, no extra text:
{
  "summary": "2-sentence response addressing their needs in Arabic or English",
  "recommendations": [
    {
      "id": "product-id",
      "name": "Exact Product Name",
      "category": "Category",
      "price": "X,XXX EGP",
      "description": "1-sentence why this fits their need",
      "priority": "essential"
    }
  ],
  "totalEstimate": "XX,XXX EGP",
  "tip": "One practical tip in Egyptian Arabic dialect"
}

Rules:
- Recommend 2-4 products from the catalog above
- priority is "essential" or "optional"
- Match language of the customer request`;

async function askOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) throw new Error("no key");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
    temperature: 0.5,
    response_format: { type: "json_object" },
  });
  return res.choices[0].message.content ?? "{}";
}

async function askGroq(prompt: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error("no key");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.5,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const d = await res.json();
  return d.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  try {
    const { needs } = await req.json();
    if (!needs?.trim())
      return NextResponse.json({ error: "Please describe your needs" }, { status: 400 });

    const catalog = PRODUCTS.slice(0, 25)
      .map((p) => `• ${p.name} | ${p.brand} | ${p.category} | ${p.priceEGP} EGP | SKU: ${p.sku}`)
      .join("\n");

    const prompt = PROMPT_TEMPLATE(needs, catalog);

    let raw = "";
    let provider = "GPT-4o";

    try {
      raw = await askOpenAI(prompt);
    } catch {
      provider = "Groq Llama 3.3";
      raw = await askGroq(prompt);
    }

    // Clean up markdown code blocks if Groq returns them
    const clean = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({ ...parsed, provider });
  } catch (err) {
    console.error("Recommend error:", err);
    return NextResponse.json(
      { error: "AI recommendation failed. Please try again or WhatsApp us." },
      { status: 500 }
    );
  }
}
