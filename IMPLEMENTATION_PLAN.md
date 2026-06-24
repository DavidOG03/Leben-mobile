# Leben Mobile — Implementation Plan

> **Living document.** Update this as features are built, changed, or descoped.
> Last updated: 2026-06-22

---

## Project Context

**Leben** (`C:/Users/DAVID/Desktop/projects/leben`) is a modular productivity OS built in Next.js 14. **Leben-mobile** is a full-featured React Native Expo 56 replica of it, sharing the same Supabase project (same DB, same users).

Web live demo: https://leben-os.vercel.app

---

## Confirmed Decisions

| Decision | Outcome |
|---|---|
| Supabase backend | **Shared** — same project, same DB, same users |
| AI keys strategy | **Supabase Edge Functions** — mirrors web's Next.js API routes; keys stay server-side |
| Auth | Email/password **+ Google OAuth** |
| Push notifications | **In scope** — `expo-notifications` with Expo Push Notification service |
| AI providers | **Gemini → DeepSeek → Groq** failover chain (identical to web) |
| Books/Reading Tracker | **In scope** — part of the Habits section in the web |
| Settings screen | **In scope** — web has a settings page |

---

## Scope (from web sidebar — exactly these features, no more)

| Screen | Web route | Notes |
|---|---|---|
| Dashboard | `/` | AI brief, Efficiency score, Today's focus, Habit streaks, Goal progress |
| Tasks | `/tasks` | Kanban, list view, priorities, tags (WORK/PERSONAL), reminders |
| Habits | `/habits` | Daily rituals, weekly progress, commitment tracker, reading tracker, books |
| Goals | `/goals` | Goal cards, progress, AI insights, milestones |
| AI Assistant | `/ai` | Neural chat, strictly bounded to user context |
| Daily Planner | `/planner` | AI-generated time-blocked schedule, insights, main focus |
| Analytics | `/analytics` | Completion rates, streak summaries, productivity history |
| Settings | `/settings` | Profile, account, purge data |

> ⚠️ Do NOT add anything that doesn't exist in the web app (e.g. social features, marketplace, onboarding flows, etc.)

---

## Navigation Structure (Bottom Bar)

5 tabs with a **dropup menu** on the Neural tab to avoid overcrowding:

```
┌─────────────────────────────────────────────────┐
│  Home    Tasks    Habits    Goals    Neural ✦    │
└─────────────────────────────────────────────────┘
                                      ↑ dropup:
                                      • Daily Planner
                                      • AI Assistant
                                      • Analytics
```

**Tab breakdown:**
| Tab | Icon | Screen(s) |
|---|---|---|
| Home | Grid | Dashboard |
| Tasks | CheckCircle | Tasks |
| Habits | Repeat | Habits + Books |
| Goals | Trophy | Goals |
| Neural ✦ | Sparkle | **Dropup:** Planner, AI Chat, Analytics |

The Neural dropup opens upward on press, showing 3 sub-links. Tapping a sub-link navigates to that screen and closes the dropup. Tapping the tab again when open closes it.

Settings is accessible from a gear icon in the Dashboard header (as a sheet/modal), not a bottom tab.

---

## AI Architecture on Mobile

The web uses Next.js API routes to keep API keys server-side. Mobile uses **Supabase Edge Functions** as the equivalent:

```
Mobile App → supabase.functions.invoke('ai-planner') → Edge Function (Deno) → Gemini/DeepSeek/Groq
```

**Edge Functions to deploy (4 total):**
- `ai-brief` — Morning brief (port of web `/api/ai/brief/route.ts`)
- `ai-planner` — Day plan generation (port of `/api/ai/planner/route.ts`)
- `ai-chat` — Neural assistant (port of `/api/ai/chat/route.ts`)
- `ai-suggest` — Habit/goal suggestions (port of `/api/ai/suggest/route.ts`)

API keys (`GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY`) are stored as **Supabase secrets** — never bundled in the app.

---

## Full File Architecture

```
Leben-mobile/
├── IMPLEMENTATION_PLAN.md      ← this file
├── supabase/
│   └── functions/
│       ├── ai-brief/index.ts
│       ├── ai-planner/index.ts
│       ├── ai-chat/index.ts
│       └── ai-suggest/index.ts
├── src/
│   ├── app/
│   │   ├── _layout.tsx                  # Root: fonts + auth redirect
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── sign-in.tsx
│   │   │   └── sign-up.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx              # Tab navigator (5 tabs + dropup)
│   │       ├── index.tsx                # Dashboard
│   │       ├── tasks.tsx
│   │       ├── habits.tsx
│   │       ├── goals.tsx
│   │       ├── planner.tsx
│   │       ├── ai.tsx                   # Neural Assistant
│   │       ├── analytics.tsx
│   │       └── settings.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   └── BottomSheet.tsx
│   │   ├── shared/
│   │   │   ├── ScreenLayout.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── NeuralDropup.tsx         # Dropup menu for Neural tab
│   │   ├── dashboard/
│   │   │   ├── AIMorningBrief.tsx
│   │   │   ├── EfficiencyScore.tsx
│   │   │   ├── TodaysFocus.tsx
│   │   │   ├── HabitStreaks.tsx
│   │   │   └── GoalProgress.tsx
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── AddTaskSheet.tsx
│   │   │   └── KanbanView.tsx
│   │   ├── habits/
│   │   │   ├── DailyRituals.tsx
│   │   │   ├── HabitCard.tsx
│   │   │   ├── WeeklyProgress.tsx
│   │   │   ├── CommitmentTracker.tsx
│   │   │   ├── AddHabitSheet.tsx
│   │   │   ├── ReadingTracker.tsx
│   │   │   └── BookCard.tsx
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx
│   │   │   ├── AddGoalSheet.tsx
│   │   │   └── AiInsightPanel.tsx
│   │   ├── planner/
│   │   │   ├── Timeline.tsx
│   │   │   └── AIInsightsCard.tsx
│   │   ├── analytics/
│   │   │   ├── CompletionChart.tsx
│   │   │   └── StreakSummary.tsx
│   │   └── ai/
│   │       └── ChatBubble.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Supabase client (AsyncStorage)
│   │   │   └── db.ts                   # All DB ops (ported from web)
│   │   └── ai/
│   │       └── client.ts               # Calls Edge Functions
│   ├── store/
│   │   ├── useStore.ts                 # Zustand (Tasks/Habits/Auth/etc.)
│   │   ├── goalSlice.ts
│   │   └── bookSlice.ts
│   ├── hooks/
│   │   ├── useAuthSync.ts
│   │   ├── useLoadUserData.ts
│   │   └── useNotifications.ts
│   ├── utils/
│   │   ├── habits.ts                   # calcStreak, calcLongestStreak
│   │   └── goals.types.ts
│   └── constants/
│       └── theme.ts                    # Extended with Leben design tokens
├── .env
└── app.json
```

---

## Design System

### Colours (matching web `globals.css` exactly)
| Token | Value |
|---|---|
| `bgPrimary` | `#0a0a0a` |
| `bgCard` | `#161616` |
| `bgSecondary` | `#1a1a1a` |
| `borderSubtle` | `#222222` |
| `accent` | `#6b7fff` (web uses `#7c6af0` in sidebar active, `#6b7fff` in CSS vars — use `#7c6af0`) |
| `textPrimary` | `#f0f0f0` |
| `textSecondary` | `#acacac` |
| `textMuted` | `rgba(255,255,255,0.25)` |
| `success` | `#4caf7d` |
| `error` | `#f87171` |

---

## Dependencies to Add

```bash
pnpm add @supabase/supabase-js @react-native-async-storage/async-storage zustand expo-notifications react-native-svg
```

> `react-native-reanimated` and `react-native-gesture-handler` are already in `package.json`.

---

## Build Phases

### [ ] Phase 0 — Install Dependencies
### [ ] Phase 1 — Design Tokens & Foundation
- [ ] Extend `src/constants/theme.ts` with `LebenColors`
- [ ] Create `.env` with Supabase credentials
- [ ] Update `app.json` with notification permissions
- [ ] Create `src/lib/supabase/client.ts`
- [ ] Create `src/lib/supabase/db.ts`
- [ ] Create `src/utils/habits.ts`
- [ ] Create `src/utils/goals.types.ts`

### [ ] Phase 2 — Supabase Edge Functions
- [ ] `supabase/functions/ai-brief/index.ts`
- [ ] `supabase/functions/ai-planner/index.ts`
- [ ] `supabase/functions/ai-chat/index.ts`
- [ ] `supabase/functions/ai-suggest/index.ts`
- [ ] `src/lib/ai/client.ts`

### [ ] Phase 3 — State Store
- [ ] `src/store/useStore.ts`
- [ ] `src/store/goalSlice.ts`
- [ ] `src/store/bookSlice.ts`

### [ ] Phase 4 — Auth & Root Layout
- [ ] Update `src/app/_layout.tsx`
- [ ] `src/app/(auth)/_layout.tsx`
- [ ] `src/app/(auth)/sign-in.tsx`
- [ ] `src/app/(auth)/sign-up.tsx`

### [ ] Phase 5 — Push Notifications
- [ ] `src/hooks/useNotifications.ts`
- [ ] Add `push_tokens` table SQL

### [ ] Phase 6 — Tab Navigator & UI Primitives
- [ ] `src/app/(tabs)/_layout.tsx` with dropup
- [ ] `src/components/shared/NeuralDropup.tsx`
- [ ] UI primitives: Button, Card, Badge, Input, BottomSheet
- [ ] Shared: ScreenLayout, EmptyState, LoadingSpinner

### [ ] Phase 7 — Dashboard
### [ ] Phase 8 — Tasks
### [ ] Phase 9 — Habits (incl. Reading Tracker)
### [ ] Phase 10 — Goals
### [ ] Phase 11 — AI Daily Planner
### [ ] Phase 12 — Analytics
### [ ] Phase 13 — Neural Assistant (AI Chat)
### [ ] Phase 14 — Settings

---

## Push Notification SQL

Add to Supabase SQL editor (if not already done from web setup):

```sql
-- Mobile push tokens table
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tokens"
  ON public.push_tokens FOR ALL USING (auth.uid() = user_id);
```

---

## Verification Checklist

- [ ] Auth: sign-up → sign-in → Google OAuth → session persists after reload
- [ ] Push: token registered in DB, local notification fires for a reminder
- [ ] Dashboard: all 5 widgets render, AI brief populates
- [ ] Tasks: create, edit, complete, delete — synced to same Supabase DB as web
- [ ] Habits: toggle today, streak increments, weekly grid updates
- [ ] Goals: create goal, update progress, AI insight loads
- [ ] Planner: day plan generates, timeline scrolls
- [ ] Analytics: completion chart renders from productivity_history
- [ ] AI Chat: sends message, receives bounded response
- [ ] Settings: user info displays, purge data works
- [ ] Design: `#0a0a0a` bg, `#7c6af0` accent on all screens
