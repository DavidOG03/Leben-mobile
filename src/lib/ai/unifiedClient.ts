import { GoogleGenAI } from "@google/genai";

interface UnifiedAiOptions {
  json?: boolean;
  temperature?: number;
}

export async function unifiedAiCall(
  input: string | any[],
  options: UnifiedAiOptions = {}
) {
  const providers = [
    { name: "Gemini", call: callGemini },
    { name: "DeepSeek", call: callDeepSeek },
    { name: "Groq", call: callGroq },
  ];

  let lastError: any = null;

  for (const provider of providers) {
    try {
      console.log(`[UnifiedAI] Attempting ${provider.name}...`);
      const result = await provider.call(input, options);
      if (result) {
        console.log(`[UnifiedAI] Success with ${provider.name}`);
        return result;
      }
    } catch (err: any) {
      console.warn(`[UnifiedAI] ${provider.name} failed:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI providers failed.");
}

async function callGemini(input: string | any[], options: UnifiedAiOptions) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key");

  const client = new GoogleGenAI({ apiKey });

  let contents: any[] = [];
  let systemInstruction: string | undefined = undefined;

  if (Array.isArray(input)) {
    const systemMessages = input.filter(m => m.role === "system");
    if (systemMessages.length > 0) {
      systemInstruction = systemMessages.map(m => m.content).join("\n\n");
    }

    contents = input
      .filter(m => m.role !== "system")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
  } else {
    contents = [{ role: "user", parts: [{ text: input }] }];
  }

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      temperature: options.temperature ?? 0.7,
      responseMimeType: options.json ? "application/json" : "text/plain",
    },
  });

  const raw = response.text || "";
  if (!raw) throw new Error("Gemini SDK returned empty response");
  return raw;
}

async function callDeepSeek(input: string | any[], options: UnifiedAiOptions) {
  const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("Missing DeepSeek API Key");

  let messages: any[] = [];
  if (Array.isArray(input)) {
    messages = input.map(m => ({ role: m.role, content: m.content }));
  } else {
    messages = [{ role: "user", content: input }];
  }

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: messages,
      response_format: options.json ? { type: "json_object" } : undefined,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`DeepSeek Error: ${res.status} ${JSON.stringify(errData)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGroq(input: string | any[], options: UnifiedAiOptions) {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing Groq API Key");

  let messages: any[] = [];
  if (Array.isArray(input)) {
    messages = input.map(m => ({ role: m.role, content: m.content }));
  } else {
    messages = [{ role: "user", content: input }];
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      response_format: options.json ? { type: "json_object" } : undefined,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Groq Error: ${res.status} ${JSON.stringify(errData)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
