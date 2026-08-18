/** `seeReply` namespace dictionaries. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'capsule': '回复给提交人',
  'label': '回复',
} satisfies Record<string, string>

/** The seeReply namespace key union. */
export type SeeReplyKey = keyof typeof zh

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The SEE reply capsule's copy. */
    seeReply: SeeReplyKey
  }
}

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'capsule': 'Reply to submitter',
  'label': 'Reply',
} satisfies Record<SeeReplyKey, string>
