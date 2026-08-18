/**
 * The SEE reply capsule entry's props. The target
 * 'conversation.chat.assistant-actions' slot is declared and typed by
 * ui-conversation (owner: messageId; framework: useSession / sessionId);
 * this package only contributes the entry.
 * @module see-dsh-reply/client/slots
 */

import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the ui-conversation SlotMap merge (the assistant-actions entry).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls this package's LocaleNamespaceMap merge (the 'seeReply' seat).
import type {} from './locales.ts'

/** Full props of the SEE reply capsule entry. */
export type ReplyActionProps =
  PropsRuntime<'conversation.chat.assistant-actions'>
  & PropsLocale<'seeReply'>

/**
 * Structural view of a turn-tail chat node's data — deliberately local so the
 * bundle keeps no cross-package type imports; the host owns the real type.
 */
export interface TurnTailDataLike {
  readonly closing: {
    readonly finalNode: { readonly messageId?: unknown }
    readonly blocks: readonly { readonly kind: string; readonly text?: string }[]
  } | null
}
