// lib/ai/client.ts
// Thin client that invokes Supabase Edge Functions instead of web's /api/ai/* fetch calls.
// API keys are stored as Supabase secrets — never bundled in the app.

import { supabase } from '@/lib/supabase/client';

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
  role:    'user' | 'assistant';
  content: string;
}

export interface AIChatResponse {
  message: string;
}

export interface AISuggestResponse {
  result: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function invokeEdge<T>(fnName: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(fnName, { body });
  if (error) throw new Error(error.message ?? `Edge function ${fnName} failed`);
  if (!data) throw new Error(`Edge function ${fnName} returned no data`);
  return data;
}

// ── AI API calls (mirrors the web's /api/ai/* fetch calls) ────────────────────

/**
 * Generate the AI morning brief.
 * Equivalent to: POST /api/ai/brief
 */
export async function getAIBrief(opts?: { forceRefresh?: boolean }): Promise<AIBriefResponse> {
  return invokeEdge<AIBriefResponse>('ai-brief', {
    forceRefresh: opts?.forceRefresh ?? false,
  });
}

/**
 * Generate the AI day plan (planner).
 * Equivalent to: POST /api/ai/planner
 */
export async function getAIDayPlan(opts?: { forceRefresh?: boolean }): Promise<AIPlannerResponse> {
  return invokeEdge<AIPlannerResponse>('ai-planner', {
    forceRefresh: opts?.forceRefresh ?? false,
  });
}

/**
 * Chat with the Neural Assistant.
 * Equivalent to: POST /api/ai/chat
 */
export async function sendAIChat(
  messages: AIChatMessage[],
  userContext?: Record<string, unknown>,
): Promise<AIChatResponse> {
  return invokeEdge<AIChatResponse>('ai-chat', { messages, userContext });
}

/**
 * Get an AI suggestion (habit, goal, etc.).
 * Equivalent to: POST /api/ai/suggest
 */
export async function getAISuggestion(prompt: string): Promise<AISuggestResponse> {
  return invokeEdge<AISuggestResponse>('ai-suggest', { prompt });
}
