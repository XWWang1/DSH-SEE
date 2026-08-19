/**
 * Local structural copies of the durable workflow-run Chat payload. The node
 * data itself is projected by ui-workflow-run's conversation definition (still
 * registered by the built-in plugin); this override only re-renders it, so the
 * shapes are mirrored here as type-only declarations with no cross-plugin
 * value imports.
 */
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'

declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
  interface ChatNodeDataMap {
    /** Durable top-level workflow run and all members that actually started (rendered by the SEE override). */
    'workflow-run': WorkflowViewChatData
  }
}

/** Status shown for a workflow, phase, or member. */
export type WorkflowViewStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'interrupted'

/** Renderer data for one member. */
export interface WorkflowViewMemberData {
  readonly seq: number
  readonly label: string
  readonly childId: SessionId
  readonly status: WorkflowViewStatus
}

/** Renderer data for one exact phase identity. */
export interface WorkflowViewPhaseData {
  readonly key: string
  readonly phase: string | null
  readonly members: readonly WorkflowViewMemberData[]
}

/** Keyed Chat payload for one workflow run. */
export interface WorkflowViewChatData {
  readonly name: string
  readonly status: WorkflowViewStatus
  readonly phases: readonly WorkflowViewPhaseData[]
}
