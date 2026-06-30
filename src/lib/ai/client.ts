// lib/ai/client.ts
// Local AI client with fallback routing (OpenAI -> Gemini -> Groq -> DeepSeek).
// Keys must start with EXPO_PUBLIC_ to be available in the React Native environment.

import { useLebenStore } from '@/store/useStore';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AIBriefResponse {
  summary:  string;
  insights: string[];
  cached?:  boolean;
}

export interface ScheduleBlock {
  time:        string;
  title:       string;
  tag:         string;
  description: string;
  status:      'pending' | 'completed' | 'skipped';
}

export interface AIInsight {
  type: string;
  text: string;
}

export interface AIPlannerResponse {
  mainFocus:   string;
  schedule:    ScheduleBlock[];
  insights:    AIInsight[];
  cached?:     boolean;
}

export interface AIChatMessage {
  role:    'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatResponse {
  message: string;
}

export interface AISuggestResponse {
  result: string;
}

// ── Fallback Router ────────────────────────────────────────────────────────────

async function generateAIResponse(
  messages: AIChatMessage[],
  expectJson: boolean = false
): Promise<string> {
  const openAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const groqKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  const deepSeekKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

  // 1. OpenAI
  if (openAIKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          response_format: expectJson ? { type: 'json_object' } : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
      console.warn('OpenAI failed:', res.status, await res.text());
    } catch (err) {
      console.warn('OpenAI error:', err);
    }
  }

  // 2. Gemini
  if (geminiKey) {
    try {
      const geminiSystemMsg = messages.find(m => m.role === 'system')?.content;
      const geminiContents = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: geminiSystemMsg ? { parts: { text: geminiSystemMsg } } : undefined,
          contents: geminiContents,
          generationConfig: expectJson ? { responseMimeType: 'application/json' } : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
      }
      console.warn('Gemini failed:', res.status, await res.text());
    } catch (err) {
      console.warn('Gemini error:', err);
    }
  }

  // 3. Groq
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          response_format: expectJson ? { type: 'json_object' } : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
      console.warn('Groq failed:', res.status, await res.text());
    } catch (err) {
      console.warn('Groq error:', err);
    }
  }

  // 4. DeepSeek
  if (deepSeekKey) {
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${deepSeekKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          response_format: expectJson ? { type: 'json_object' } : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
      console.warn('DeepSeek failed:', res.status, await res.text());
    } catch (err) {
      console.warn('DeepSeek error:', err);
    }
  }

  throw new Error("All AI providers failed. The system is currently too busy or unavailable.");
}

// ── State Fetcher ──────────────────────────────────────────────────────────────
function getUserStateSummary() {
  const { tasks, habits, goals } = useLebenStore.getState();
  return JSON.stringify({
    tasks: tasks.map(t => ({ title: t.title, priority: t.priority, completed: t.completed })),
    habits: habits.map(h => ({ name: h.name, streak: h.streak, checked: h.checked })),
    goals: goals.map(g => ({ title: g.title, currentValue: g.currentValue, targetValue: g.targetValue }))
  });
}

// ── App Functions ─────────────────────────────────────────────────────────────

export async function getAIBrief(opts?: { forceRefresh?: boolean }): Promise<AIBriefResponse> {
  const state = getUserStateSummary();
  const systemPrompt = `You are Leben, an elite personal operating system.
Your job is to provide a concise, hard-hitting morning brief based on the user's tasks, habits, and goals.
Return ONLY valid JSON in this format:
{
  "summary": "A punchy, 1-2 sentence motivating headline.",
  "insights": ["Insight 1", "Insight 2", "Insight 3"]
}`;

  const textResponse = await generateAIResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Here is my current state:\n${state}` }
  ], true);

  return JSON.parse(textResponse) as AIBriefResponse;
}

export async function getAIDayPlan(opts?: { forceRefresh?: boolean }): Promise<AIPlannerResponse> {
  const state = getUserStateSummary();
  const systemPrompt = `You are Leben, an elite personal operating system.
Create a structured day plan based on the user's tasks, habits, and goals.
Time schedule should be logical (e.g. 08:00, 10:00).
Return ONLY valid JSON in this format:
{
  "mainFocus": "The single most important thing to accomplish today",
  "schedule": [
    { "time": "09:00", "title": "Deep Work", "tag": "work", "description": "Focus on high priority tasks", "status": "pending" }
  ],
  "insights": [
    { "type": "productivity", "text": "Some insight about their habits" }
  ]
}`;

  const textResponse = await generateAIResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Here is my current state:\n${state}` }
  ], true);

  return JSON.parse(textResponse) as AIPlannerResponse;
}

export async function sendAIChat(
  messages: AIChatMessage[],
  userContext?: Record<string, unknown>
): Promise<AIChatResponse> {
  const state = getUserStateSummary();
  const systemPrompt = `You are the Leben Neural Assistant. You help the user manage their life, tasks, and goals.
Be concise, direct, and elite. Do not ramble.
Current user state:
${state}
${userContext ? 'Extra Context:\n' + JSON.stringify(userContext) : ''}`;

  const fullMessages: AIChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const responseText = await generateAIResponse(fullMessages, false);
  return { message: responseText };
}

export async function getAISuggestion(prompt: string): Promise<AISuggestResponse> {
  const systemPrompt = `You are a helpful AI that provides a concise, 1-sentence suggestion. Return ONLY valid JSON in this format: { "result": "your suggestion" }`;
  const textResponse = await generateAIResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ], true);

  return JSON.parse(textResponse) as AISuggestResponse;
}

export interface TaskPrioritySuggestion {
  task:          string;
  reason:        string;
  action:        string;
  priorityScore: number;
}

/**
 * Picks the single highest-priority pending task from a list.
 * Returns a structured suggestion with a coaching reason and CTA.
 */
export async function getTaskPriority(
  taskList: string,
  currentTime: string,
  totalPending: number,
): Promise<TaskPrioritySuggestion> {
  const systemPrompt = `You are an elite productivity strategist.
Analyze the provided task list and pick the ONE most critical/high-priority task right now.
Return ONLY valid JSON — no markdown, no backticks, no extra text — matching this schema exactly:
{"task":"<exact title>","reason":"<sharp coaching insight, max 15 words>","action":"<punchy 2-word verb phrase>","priorityScore":<integer 1-100>}`;

  const userMessage = `Current Time: ${currentTime}
Total Pending Tasks: ${totalPending}

Tasks:
${taskList}`;

  const textResponse = await generateAIResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userMessage },
  ], true);

  // Strip any accidental markdown fences the model may add
  const clean = textResponse.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as TaskPrioritySuggestion;
}

