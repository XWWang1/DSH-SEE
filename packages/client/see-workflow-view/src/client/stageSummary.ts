/**
 * Per-stage findings loader: fetches a stage subagent's child session over the
 * app's same-origin RPC and distills its final assistant message into display
 * bullets. The SEE orchestration makes every stage agent return a
 * schema-validated {sufficient, findings, references} object as its final
 * message, so the last assistant text parses as JSON; a plain-text fallback
 * keeps the view useful when the model wrapped or deviated from the schema.
 */

import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'

/** Distilled display data for one stage card. */
export interface StageSummary {
  readonly bullets: readonly string[]
  readonly references: string
}

const EMPTY: StageSummary = { bullets: [], references: '' }
const cache = new Map<SessionId, StageSummary>()

/** Envelope event wrapper shape returned by session.history. */
interface HistoryEventWrapper {
  readonly event?: {
    readonly type?: string
    readonly data?: unknown
  }
}

/** assistant/message data face (only the fields read here). */
interface AssistantMessageData {
  readonly message?: {
    readonly content?: readonly { readonly type?: string; readonly text?: string }[]
  }
}

/** Parsed stage-result face (only the fields read here). */
interface StageResult {
  readonly findings?: unknown
  readonly references?: unknown
}

function lastAssistantText(events: readonly HistoryEventWrapper[]): string {
  let text = ''
  for (const wrapper of events) {
    const event = wrapper.event
    if (event?.type !== 'assistant/message') continue
    const data = event.data as AssistantMessageData | undefined
    const blocks = data?.message?.content
    if (blocks === undefined) continue
    const joined = blocks
      .filter(block => block.type === 'text')
      .map(block => block.text ?? '')
      .join('')
      .trim()
    if (joined !== '') text = joined
  }
  return text
}

/** Extract the first balanced JSON object from text that may carry fences or prose. */
function parseStageResult(text: string): StageResult | null {
  let candidate = text.trim()
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(candidate)
  if (fence?.[1] !== undefined) candidate = fence[1].trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    const parsed: unknown = JSON.parse(candidate.slice(start, end + 1))
    if (typeof parsed === 'object' && parsed !== null) return parsed as StageResult
  } catch {
    return null
  }
  return null
}

/**
 * Pluck reference lines from free-form stage prose. Schema-resolved stages
 * carry a dedicated field; plain-text finals (like this deployment's) often
 * narrate sources as「出处：…」/「引用：…」lines instead.
 */
function extractReferences(text: string): string {
  const hits: string[] = []
  for (const match of text.matchAll(/(?:出处|引用|参考|来源)[：:]\s*([^\n。；]+)/g)) {
    const value = match[1]?.trim()
    if (value !== undefined && value !== '') hits.push(value)
  }
  return hits.join('；')
}

/** Split a findings string into ≤5 display bullets, each capped at 120 chars. */
function toBullets(source: string): string[] {
  const parts = source
    .split(/\r?\n|(?<=[。；;])\s*/)
    .map(part => part
      .trim()
      .replace(/^[-·•*]\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/^\d+[.、)]\s*/, ''))
    .filter(part => part !== '')
  const bullets: string[] = []
  for (const part of parts) {
    bullets.push(part.length > 120 ? `${part.slice(0, 120)}…` : part)
    if (bullets.length >= 5) break
  }
  return bullets
}

/**
 * Load one stage member's distilled findings (cached per child session).
 * Never throws: transport or shape failures yield the empty summary.
 * @param childId - the stage subagent's child session.
 * @returns bullets plus references line ('' when absent).
 */
export async function loadStageSummary(childId: SessionId): Promise<StageSummary> {
  const hit = cache.get(childId)
  if (hit !== undefined) return hit
  try {
    const resp = await fetch('/api/session.history', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type: 'client-request',
        rpcId: crypto.randomUUID(),
        method: 'session.history',
        payload: { sessionId: childId },
      }),
    })
    if (!resp.ok) return EMPTY
    const body: unknown = await resp.json()
    const value = (body as { result?: { value?: { events?: unknown } } })?.result?.value
    const events = Array.isArray(value?.events) ? value.events as readonly HistoryEventWrapper[] : []
    const text = lastAssistantText(events)
    const parsed = parseStageResult(text)
    const findings = typeof parsed?.findings === 'string' ? parsed.findings : text
    const schemaRefs = typeof parsed?.references === 'string' ? parsed.references.trim() : ''
    const references = schemaRefs !== '' ? schemaRefs : extractReferences(text)
    const summary: StageSummary = { bullets: toBullets(findings), references }
    cache.set(childId, summary)
    return summary
  } catch {
    return EMPTY
  }
}
