/**
 * SEE workflow-run view override plugin, browser half: shadows the built-in
 * ui-workflow-run Chat renderer for the 'workflow-run' node key. The SEE
 * delta: stage/member rows navigate into the subagent child session even
 * after the run completes, so a reviewer can audit each stage's full process
 * (the built-in panel only navigates while members are still running). The
 * conversation definition that projects tool-workflow events stays with the
 * built-in plugin; only the keyed renderer is shadowed here.
 * @module see-workflow-view/client
 */

import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the ui-conversation ChatNodeDataMap merge (the workflow-run key).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { SeeWorkflowPanel, type WorkflowViewInjected } from './SeeWorkflowPanel.tsx'
import { en, NS, type WorkflowViewKey, zh } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** SEE workflow-run override copy. */
    seeWorkflowView: WorkflowViewKey
  }
}

/** Required services: the slot registry, session navigation, and the copy. */
export const inject = ['slots', 'sessions', 'locale']

/**
 * Client plugin body: the overriding workflow-run renderer entry.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'see-workflow-view: dictionaries')

  ctx.slots.inject('conversation.chat.node', () => {
    // priority -1 vs the built-in entry's default 0: lowest renders, so this
    // panel shadows ui-workflow-run's. Same-priority would throw at boot.
    const dispose = ctx.slots.register({
      name: 'conversation.chat.node',
      key: 'workflow-run',
      priority: -1,
      locale: NS,
      inject: (): WorkflowViewInjected => ({
        openSession: (id: SessionId) => { ctx.sessions.open(id) },
      }),
    }, SeeWorkflowPanel)
    return () => { dispose() }
  })
}
