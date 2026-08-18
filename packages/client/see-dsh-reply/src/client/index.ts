/**
 * SEE reply bridge plugin, browser half: a blue "回复" capsule in the
 * conversation.chat.assistant-actions strip. Clicking it forwards the closing
 * assistant message's text plus the sessionId to the SEE host page via
 * window.parent.postMessage, which then drives the reply delivery. Renders
 * nothing unless embedded in an iframe (standalone DSH has no listener).
 * @module see-dsh-reply/client
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the ui-conversation SlotMap merge (the assistant-actions entry).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { ReplyAction } from './ReplyAction.tsx'
import { en, zh } from './locales.ts'

/** Dictionary namespace owned by this plugin. */
const NS = 'seeReply'

/** Required services: the slot registry and the copy. */
export const inject = ['slots', 'locale']

/**
 * Client plugin body: the SEE reply capsule entry.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'see-dsh-reply: dictionaries')

  ctx.slots.inject('conversation.chat.assistant-actions', () => {
    const dispose = ctx.slots.register({
      name: 'conversation.chat.assistant-actions',
      id: 'see-reply',
      order: 20,
      locale: NS,
    }, ReplyAction)
    return () => { dispose() }
  })
}
