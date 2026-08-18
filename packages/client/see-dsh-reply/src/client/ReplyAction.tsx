/**
 * The SEE reply capsule: a blue pill labeled 回复 sitting in the assistant
 * message's action strip between the like/dislike icons and branch. Clicking
 * it hands the message text and session identity to the SEE host page.
 * @module see-dsh-reply/client/ReplyAction
 */

import { useCallback } from 'react'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ReplyActionProps, TurnTailDataLike } from './slots.ts'
import css from './ReplyAction.module.css'

/** Rendered only when a host page embeds the app; standalone hides it. */
const embedded = typeof window !== 'undefined' && window.parent !== window

/**
 * One message's SEE reply capsule.
 * @param props - the owner's message identity, the session standard kit, and copy.
 * @returns the capsule button, or null when not iframe-embedded.
 */
export function ReplyAction({ messageId, sessionId, useSession, t }: ReplyActionProps) {
  // The owner hands over only messageId; the text is recovered from the
  // session snapshot by locating the turn-tail node this message closes.
  const text = useSession((snapshot) => {
    for (const node of snapshot.chat.nodes.values()) {
      if (node.kind !== 'turn-tail') continue
      const data = node.data as TurnTailDataLike | undefined
      if (data?.closing?.finalNode.messageId !== messageId) continue
      return data.closing.blocks
        .filter(b => b.kind === 'text')
        .map(b => b.text ?? '')
        .join('')
    }
    return ''
  })

  const onReply = useCallback(() => {
    if (!embedded || text === '') return
    window.parent.postMessage({ type: 'see-dsh-reply', sessionId, text }, '*')
  }, [sessionId, text])

  if (!embedded) return null

  return (
    <Tooltip label={t('capsule')} side="bottom">
      <button type="button" className={css.capsule} aria-label={t('capsule')} onClick={onReply}>
        {t('label')}
      </button>
    </Tooltip>
  )
}
