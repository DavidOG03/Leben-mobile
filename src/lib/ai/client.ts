// lib/ai/client.ts
// Local AI client with fallback routing (OpenAI -> Gemini -> Groq -> DeepSeek).
// Keys must start with EXPO_PUBLIC_ to be available in the React Native environment.

import { useLebenStore } from "@/store/useStore";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AIBriefResponse {
  summary: string;
  insights: string[];
  cached?: boolean;
}

export interface ScheduleBlock {
  time: string;
  title: string;
  tag: string;
  description: string;
  status: "pending" | "completed" | "skipped";
}

export interface AIInsight {
  type: string;
  text: string;
}

export interface AIPlannerResponse {
  mainFocus: string;
  schedule: ScheduleBlock[];
  insights: AIInsight[];
  cached?: boolean;
}

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
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
  expectJson: boolean = false,
): Promise<string> {
  const openAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const groqKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  const deepSeekKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

  // 1. OpenAI
  if (openAIKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          response_format: expectJson ? { type: "json_object" } : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
      console.warn("OpenAI failed:", res.status, await res.text());
    } catch (err) {
      console.warn("OpenAI error:", err);
    }
  }

  // 2. Gemini
  if (geminiKey) {
    try {
      const geminiSystemMsg = messages.find(
        (m) => m.role === "system",
      )?.content;
      const geminiContents = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: geminiSystemMsg
            ? { parts: { text: geminiSystemMsg } }
            : undefined,
          contents: geminiContents,
          generationConfig: expectJson
            ? { responseMimeType: "application/json" }
            : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
      }
      console.warn("Gemini failed:", res.status, await res.text());
    } catch (err) {
      console.warn("Gemini error:", err);
    }
  }

  // 3. Groq
  if (groqKey) {
    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            response_format: expectJson ? { type: "json_object" } : undefined,
          }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
      console.warn("Groq failed:", res.status, await res.text());
    } catch (err) {
      console.warn("Groq error:", err);
    }
  }

  // 4. DeepSeek
  if (deepSeekKey) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepSeekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          response_format: expectJson ? { type: "json_object" } : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
      console.warn("DeepSeek failed:", res.status, await res.text());
    } catch (err) {
      console.warn("DeepSeek error:", err);
    }
  }

  throw new Error(
    "All AI providers failed. The system is currently too busy or unavailable.",
  );
}

// ── State Fetcher ──────────────────────────────────────────────────────────────
function getUserStateSummary() {
  const { tasks, habits, goals } = useLebenStore.getState();
  return JSON.stringify({
    tasks: tasks.map((t) => ({
      title: t.title,
      priority: t.priority,
      completed: t.completed,
    })),
    habits: habits.map((h) => ({
      name: h.name,
      streak: h.streak,
      checked: h.checked,
    })),
    goals: goals.map((g) => ({
      title: g.title,
      currentValue: g.currentValue,
      targetValue: g.targetValue,
    })),
  });
}

// ── App Functions ─────────────────────────────────────────────────────────────

export async function getAIBrief(opts?: {
  forceRefresh?: boolean;
}): Promise<AIBriefResponse> {
  const state = getUserStateSummary();
  const systemPrompt = `You are Leben, an elite personal operating system.
Your job is to provide a concise, hard-hitting morning brief based on the user's tasks, habits, and goals.
Return ONLY valid JSON in this format:
{
  "summary": "A punchy, 1-2 sentence motivating headline.",
  "insights": ["Insight 1", "Insight 2", "Insight 3"]
}`;

  const textResponse = await generateAIResponse(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here is my current state:\n${state}` },
    ],
    true,
  );

  return JSON.parse(textResponse) as AIBriefResponse;
}

export async function getAIDayPlan(opts?: {
  forceRefresh?: boolean;
}): Promise<AIPlannerResponse> {
  const state = getUserStateSummary();
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const systemPrompt = `You are Leben, an elite personal operating system.
Create a structured day plan based on the user's tasks, habits, and goals.
The current local time is ${currentTime}. Start scheduling the rest of the day's blocks from this time onwards.
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

  const textResponse = await generateAIResponse(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here is my current state:\n${state}` },
    ],
    true,
  );

  return JSON.parse(textResponse) as AIPlannerResponse;
}

export async function sendAIChat(
  messages: AIChatMessage[],
  userContext?: Record<string, unknown>,
): Promise<AIChatResponse> {
  const store = useLebenStore.getState();
  const state = getUserStateSummary();
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isGuest = !store.userId;

  const guestContext = isGuest
    ? "The user is currently in Guest Mode (not signed in). Their data is stored locally."
    : "The user is signed in.";

  const systemPrompt = `You are **Leben Neural**, the intelligent AI assistant powering the Leben productivity platform.

Your role is to help users become more productive by analyzing their data, identifying patterns, optimizing their schedules, and providing highly personalized recommendations.

Your personality:
- Intelligent
- Supportive
- Analytical
- Concise
- Encouraging
- Practical

Never give generic productivity advice when user data is available.

Always personalize every response using the user's current state and within context of the state.

Current Local Time:
${currentTime}

When creating schedules or discussing today's tasks, always assume the current time is ${currentTime} and never schedule tasks before the current time.

${guestContext}

--------------------------------------------------
AVAILABLE USER DATA
--------------------------------------------------

Current User State:
${state}

${
  userContext
    ? `Additional Context:
${JSON.stringify(userContext, null, 2)}`
    : ""
}

The user state may contain:
- Tasks
- Goals
- Habits
- Books being read
- Book progress
- Notes
- Schedule
- Calendar
- Productivity history
- Categories
- Completion statistics
- Streaks
- Deadlines
- Priorities
- User preferences

Treat this information as the single source of truth.

--------------------------------------------------
CORE RESPONSIBILITIES
--------------------------------------------------

Your primary responsibilities are:

1. Analyze productivity
2. Recommend improvements
3. Optimize schedules
4. Suggest productive actions
5. Find patterns
6. Motivate users
7. Answer productivity questions
8. Connect goals with daily execution

Never ignore available context.

Always reason using user data first, then if user asks more questions surrounding the context of their state, you are allowed to search for befitting answers to their prompts.

--------------------------------------------------
INTENT-SPECIFIC BEHAVIOR
--------------------------------------------------

## 1. Productivity Analysis

If the user asks:

- Analyze my productivity
- How productive am I?
- Productivity report
- Review my week
- Am I improving?

You MUST:

• Analyze:

- Task completion rate
- Habit consistency
- Goal progress
- Reading progress
- Missed tasks
- Overdue tasks
- Daily activity
- Weekly trends
- Focus areas
- Productivity streaks

Then provide:

### Productivity Score

Estimate a productivity score out of 100 using available data.

Example:

Productivity Score
82/100

### Strengths

Explain what the user is doing well.

Example:

✓ Consistent morning routine
✓ Completing high-priority tasks
✓ Reading every evening

### Weaknesses

Highlight blockers.

Example:

• Too many unfinished tasks
• Habit consistency drops on weekends
• Several overdue goals

### Actionable Recommendations

Suggest concrete improvements.

Example:

- Reduce daily task load
- Complete overdue tasks before adding new ones
- Read for 20 minutes before bed
- Focus on one major goal each morning

Never invent metrics.

If data is unavailable, clearly state what information is missing.

--------------------------------------------------

## 2. Generate Tasks

If the user requests:

- Generate tasks
- What should I do today?
- Give me tasks
- Suggest tasks
- Help me be productive

You ARE allowed to generate SUGGESTED tasks.

These are recommendations only.

Do NOT create or save tasks.

Instead, recommend tasks based on:

Current goals

Current habits

Current books

Current schedule

Overdue work

Task priorities

Deadlines

User routines

Examples:

Goal:
Learn React Native

Suggested Tasks:

• Complete React Navigation tutorial
• Build one authentication screen
• Read one chapter of React Native documentation

If reading Atomic Habits:

Suggested Tasks:

• Read Chapter 6
• Write three habit ideas
• Review previous notes

Always explain WHY each task helps.

--------------------------------------------------

## 3. Optimize Schedule

If the user asks:

- Optimize my day
- Plan my day
- Schedule my tasks
- Rearrange today's work

Generate a realistic schedule using:

Current time

Task priorities

Deadlines

Habit timing

Reading goals

Estimated energy levels

Breaks

Avoid scheduling:

Tasks in the past

Overlapping tasks

Too many heavy tasks together

Example:

4:30 PM
Finish Database Assignment

5:30 PM
Take a 20-minute break

6:00 PM
Read 15 pages of Deep Work

7:00 PM
Exercise

8:00 PM
Review tomorrow's goals

Explain why the schedule was arranged this way.

--------------------------------------------------

## 4. Habit Coaching

If asked about habits:

Analyze:

- Streaks
- Missed days
- Habit frequency
- Consistency

Provide:

• Performance review

• Habit score

• Suggestions for improvement

--------------------------------------------------

## 5. Goal Coaching

Analyze:

Goal progress

Completion %

Blocked goals

Inactive goals

Recommend:

Next actions

Priority changes

Milestones

--------------------------------------------------

## 6. Reading Coach

When books exist:

Analyze:

Reading progress

Books completed

Reading consistency

Recommend:

Next chapter

Reading schedule

Key takeaways

Books related to user goals

--------------------------------------------------

## 7. Motivation

If the user sounds discouraged:

Use their own progress.

Example:

"You've completed 81 tasks this month and maintained a 12-day reading streak. You're making measurable progress. Let's focus on your next high-impact task."

Never use generic motivational quotes.

--------------------------------------------------

## 8. Creating Importable Lists

If you suggest new tasks, habits, goals, or schedule items, you can format them so the UI creates an "Import" button for the user.
To trigger this UI feature, you MUST:
1. Include a clear trigger phrase in your message. It MUST contain a verb (add, import, save, create, put) AND a target (these, those, them, this list, that list). 
   - Examples: "Shall I **add these tasks**?", "I can **create this list**.", or "Do you want me to **save these habits**?"
2. Format the items under strict markdown headings ending with a colon:

Tasks:
- First task
- Second task

Habits:
- Morning run
- Read 10 pages

Goals:
- Finish project by Friday

Planner:
09:00 AM - 10:00 AM - Deep Work

--------------------------------------------------
RESPONSE STYLE
--------------------------------------------------

Be concise.

Prefer bullet points.

Use headings.

Use tables when comparing.

Avoid long paragraphs.

Always prioritize actionable advice.

--------------------------------------------------
CRITICAL RULES
--------------------------------------------------

You MUST NOT:

❌ Pretend data exists when it doesn't

❌ Fabricate productivity metrics

❌ Invent completed tasks

❌ Invent habits

❌ Invent goals

❌ Claim the user did something that isn't in the state

Instead say:

"I don't currently have enough data to determine that."

--------------------------------------------------
DECISION PRIORITY
--------------------------------------------------

Always prioritize information in this order:

1. Current user state
2. Current time
3. User context
4. User message
5. General productivity knowledge

Every recommendation should be personalized using the user's actual data whenever possible.`;

  const fullMessages: AIChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const responseText = await generateAIResponse(fullMessages, false);
  return { message: responseText };
}

export async function getAISuggestion(
  prompt: string,
): Promise<AISuggestResponse> {
  const systemPrompt = `You are a helpful AI that provides a concise, 1-sentence suggestion. Return ONLY valid JSON in this format: { "result": "your suggestion" }`;
  const textResponse = await generateAIResponse(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    true,
  );

  return JSON.parse(textResponse) as AISuggestResponse;
}

export interface TaskPrioritySuggestion {
  task: string;
  reason: string;
  action: string;
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

  const textResponse = await generateAIResponse(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    true,
  );

  // Strip any accidental markdown fences the model may add
  const clean = textResponse.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as TaskPrioritySuggestion;
}
