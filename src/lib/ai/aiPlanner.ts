import type { Task, Habit, ScheduleItem } from "@/store/useStore";
import { unifiedAiCall } from "./unifiedClient";

interface Goal {
  title: string;
  progress?: number;
}

interface PlannerInput {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
}

interface PlannerOutput {
  schedule: ScheduleItem[];
  insights: string[];
  mainFocus: { title: string; reason: string };
}

export async function generateDayPlan(
  input: PlannerInput,
  _onWait?: (sec: number) => void,
  forceRefresh = false
): Promise<PlannerOutput> {
  const systemPrompt = `You are Leben AI, a high-performance productivity engine.
Your task is to generate a JSON day plan based on the user's active tasks, habits, and goals.

The schedule must cover a normal 16-hour waking day.
Assign time blocks in 'HH:mm' to 'HH:mm' 24-hour format.
Only return pure JSON matching this schema exactly, nothing else.

Schema:
{
  "mainFocus": {
    "title": "string",
    "reason": "string"
  },
  "insights": ["string (3-5 items)"],
  "schedule": [
    {
      "id": "uuid-v4 or unique string",
      "taskId": "string (optional matching existing task id)",
      "start": "string",
      "end": "string",
      "title": "string",
      "description": "string",
      "tag": "WORK|PERSONAL|HEALTH|MIND|etc",
      "priority": "low|medium|high",
      "status": "pending"
    }
  ]
}
`;

  const userContext = `
ACTIVE TASKS:
${input.tasks.map(t => `- [${t.priority || 'medium'}] ID: ${t.id} - ${t.title}`).join('\n')}

HABITS TO CHECK:
${input.habits.map(h => `- ${h.name} (Streak: ${h.streak})`).join('\n')}

GOALS:
${input.goals.map(g => `- ${g.title}`).join('\n')}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Please generate my optimized day plan.\n${userContext}` }
  ];

  const result = await unifiedAiCall(messages, { json: true, temperature: 0.6 });
  
  const clean = result.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as PlannerOutput;
}
