/**
 * SEE override of the durable workflow-run Chat renderer: a stage-trajectory
 * view for the four-phase troubleshoot orchestration. Each phase renders as
 * an icon card (📄 日志/📚 知识库/💻 代码/🌐 联网, matched by phase title)
 * carrying the stage subagent's findings as bullet lines, stages joined by ↓
 * connectors in execution order. The stage header (icon included) toggles the
 * body; a per-stage 查看完整过程 action opens the child session — at any
 * outcome, not only while the run is live.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { StateDot, type StateDotState } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { shallowEqual, type SessionId, type SessionListState } from '@deepseek-ai/dsh-client-runtime/client'
import type { WorkflowViewKey } from './locales.ts'
import type {
  WorkflowViewPhaseData, WorkflowViewStatus,
} from './types.ts'
import { loadStageSummary, type StageSummary } from './stageSummary.ts'
import css from './SeeWorkflowPanel.module.css'

/** Navigation action injected from the plugin's own SessionRuntime access. */
export interface WorkflowViewInjected {
  readonly openSession: (id: SessionId) => void
}

/** Complete keyed Chat renderer props. */
export type SeeWorkflowPanelProps =
  PropsRuntime<'conversation.chat.node', 'workflow-run'>
  & PropsLocale<'seeWorkflowView'>
  & WorkflowViewInjected

const STATUS_KEYS = {
  running: 'status.running',
  completed: 'status.completed',
  failed: 'status.failed',
  cancelled: 'status.cancelled',
  interrupted: 'status.interrupted',
} as const satisfies Record<WorkflowViewStatus, WorkflowViewKey>

interface PhaseVisual {
  readonly icon: string
  readonly accent: 'log' | 'kb' | 'code' | 'web' | 'other'
}

const PHASE_VISUALS: readonly { match: RegExp; visual: PhaseVisual }[] = [
  { match: /日志|语义|报错/, visual: { icon: '📄', accent: 'log' } },
  { match: /知识库|知识|文档/, visual: { icon: '📚', accent: 'kb' } },
  { match: /代码|源码/, visual: { icon: '💻', accent: 'code' } },
  { match: /联网|网络|网页|搜索/, visual: { icon: '🌐', accent: 'web' } },
]

function phaseVisual(title: string | null): PhaseVisual {
  const text = title ?? ''
  for (const entry of PHASE_VISUALS) {
    if (entry.match.test(text)) return entry.visual
  }
  return { icon: '🧩', accent: 'other' }
}

function dotState(status: WorkflowViewStatus): StateDotState {
  switch (status) {
    case 'running': return 'ongoing'
    case 'completed': return 'done'
    case 'failed': return 'error'
    case 'cancelled':
    case 'interrupted': return 'warning'
    /* v8 ignore next -- WorkflowViewStatus is closed and every variant is handled above. */
    default: return status satisfies never
  }
}

function readablePhase(phase: string | null, t: SeeWorkflowPanelProps['t']): string {
  if (phase === null) return t('phase.unassigned')
  return phase === '' ? t('phase.empty') : phase
}

function memberCount(count: number, t: SeeWorkflowPanelProps['t']): string {
  return t(count === 1 ? 'run.members.one' : 'run.members.other', { count })
}

/** SEE delta: a child session in the list with subagent lineage stays navigable at any outcome. */
function navigableChildren(
  sessions: SessionListState,
  phases: readonly WorkflowViewPhaseData[],
  parentId: SessionId,
): ReadonlySet<SessionId> {
  const ordinary = new Set(sessions.ids)
  const result = new Set<SessionId>()
  for (const phase of phases) {
    for (const member of phase.members) {
      const summary = sessions.byId[member.childId]
      if (
        ordinary.has(member.childId)
        && summary?.origin === 'subagent'
        && summary.parentId === parentId
      ) {
        result.add(member.childId)
      }
    }
  }
  return result
}

function RunBar({ name, count, status, t }: {
  readonly name: string
  readonly count: number
  readonly status: WorkflowViewStatus
  readonly t: SeeWorkflowPanelProps['t']
}) {
  return (
    <div className={css.runBar} data-run-bar>
      <span className={css.runTitle}>{t('run.title', { name })}</span>
      <span className={css.runMeta}>{memberCount(count, t)}</span>
      <span className={css.statusChip} data-status={status}>
        <StateDot state={dotState(status)} />
        <span>{t(STATUS_KEYS[status])}</span>
      </span>
    </div>
  )
}

function StageCard({ phase, navigable, openSession, t }: {
  readonly phase: WorkflowViewPhaseData
  readonly navigable: ReadonlySet<SessionId>
  readonly openSession: WorkflowViewInjected['openSession']
  readonly t: SeeWorkflowPanelProps['t']
}) {
  const primary = phase.members[0]
  const extraCount = phase.members.length - 1
  const visual = phaseVisual(phase.phase)
  const skipped = primary === undefined ? false : primary.label.includes('无需检索分析')
  const status: WorkflowViewStatus = primary === undefined ? 'completed' : primary.status
  const childNavigable = primary !== undefined && navigable.has(primary.childId)
  // Skipped (placeholder) members ship their reason inline as the bullet — no summary fetch needed.
  const skippedSummary: StageSummary = skipped && primary !== undefined
    ? { bullets: [primary.label], references: '' }
    : { bullets: [], references: '' }

  const [open, setOpen] = useState(true)
  const [summary, setSummary] = useState<StageSummary | undefined>(skipped ? skippedSummary : undefined)

  useEffect(() => {
    if (primary === undefined || status !== 'completed') return
    let cancelled = false
    loadStageSummary(primary.childId).then((value) => {
      if (!cancelled) setSummary(value)
    })
    return () => { cancelled = true }
  }, [primary, status])

  if (primary === undefined) return null

  const title = readablePhase(phase.phase, t)

  let body: ReactNode = null
  if (open) {
    if (status === 'running') {
      body = <div className={css.stageNote} data-stage-note="running">{t('stage.running')}</div>
    } else if (status === 'completed') {
      const bullets = summary === undefined ? undefined : summary.bullets
      body = (
        <div className={css.stageBody} data-stage-body>
          {summary === undefined
            ? <div className={css.stageNote} data-stage-note="loading">{t('stage.loading')}</div>
            : (
              <>
                <ul className={css.bullets}>
                  {(bullets !== undefined && bullets.length > 0
                    ? bullets
                    : [primary.label]
                  ).map((line, index) => (
                    <li key={index} className={css.bullet}>· {line}</li>
                  ))}
                </ul>
                {extraCount > 0
                  ? <div className={css.extra}>{t('stage.more', { count: extraCount })}</div>
                  : null}
                {summary.references !== ''
                  ? <div className={css.refs}>{t('stage.refs', { refs: summary.references })}</div>
                  : null}
              </>
            )}
          {childNavigable
            ? (
              <button
                type="button"
                className={css.openFull}
                data-open-full
                aria-label={t('member.open', { name: title })}
                onClick={() => { openSession(primary.childId) }}
              >
                {t('stage.openFull')}
              </button>
            )
            : null}
        </div>
      )
    } else {
      body = <div className={css.stageBody} data-stage-body><div className={css.stageNote} data-status={status}>{t('stage.failed')}</div></div>
    }
  }

  return (
    <div className={css.stage} data-stage data-accent={visual.accent} data-status={status} data-skipped={skipped || undefined}>
      <button
        type="button"
        className={css.stageHeader}
        data-stage-header
        aria-expanded={open}
        onClick={() => { setOpen(value => !value) }}
      >
        <span className={css.iconWrap} data-stage-icon aria-hidden>{visual.icon}</span>
        <span className={css.stageTitles}>
          <span className={css.phaseTitle}>{title}</span>
          <span className={css.memberLabel}>{primary.label}</span>
        </span>
        {skipped
          ? <span className={css.skipBadge} data-skip-badge>{t('stage.skipped')}</span>
          : null}
        <span className={css.statusChip} data-status={status}>
          <StateDot state={dotState(status)} />
          <span>{t(STATUS_KEYS[status])}</span>
        </span>
        <span className={css.chev} aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {body}
    </div>
  )
}

/** SEE trajectory panel: icon stage cards joined by connectors, findings inline. */
export function SeeWorkflowPanel({ node, sessionId, useSessions, openSession, t }: SeeWorkflowPanelProps) {
  const totalMembers = node.data.phases.reduce((count, phase) => count + phase.members.length, 0)
  const navigable = useSessions(
    sessions => navigableChildren(sessions, node.data.phases, sessionId),
    shallowEqual,
  )
  return (
    <section className={css.root} data-see-workflow-view data-run-status={node.data.status}>
      <RunBar
        name={node.data.name}
        count={totalMembers}
        status={node.data.status}
        t={t}
      />
      <div className={css.stages}>
        {node.data.phases.map((phase, index) => (
          <StageCardFragment
            key={phase.key}
            phase={phase}
            index={index}
            total={node.data.phases.length}
            navigable={navigable}
            openSession={openSession}
            t={t}
          />
        ))}
      </div>
    </section>
  )
}

/** One stage card plus the connector that follows it (except after the last). */
function StageCardFragment(props: {
  readonly phase: WorkflowViewPhaseData
  readonly index: number
  readonly total: number
  readonly navigable: ReadonlySet<SessionId>
  readonly openSession: WorkflowViewInjected['openSession']
  readonly t: SeeWorkflowPanelProps['t']
}) {
  const { phase, index, total, ...rest } = props
  return (
    <>
      <StageCard phase={phase} {...rest} />
      {index < total - 1
        ? <div className={css.connector} data-accent={phaseVisual(props.phase.phase).accent} aria-hidden>↓</div>
        : null}
    </>
  )
}
