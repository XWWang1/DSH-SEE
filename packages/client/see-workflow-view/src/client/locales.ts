/** `seeWorkflowView` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'seeWorkflowView'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'run.title': '{name}',
  'run.members.one': '{count} 个子任务',
  'run.members.other': '{count} 个子任务',
  'phase.unassigned': '未分阶段',
  'phase.empty': '空阶段名',
  'status.running': '进行中',
  'status.completed': '已完成',
  'status.failed': '失败',
  'status.cancelled': '已取消',
  'status.interrupted': '已中断',
  'member.open': '查看 {name} 的完整过程',
  'stage.loading': '正在获取本阶段内容…',
  'stage.running': '本阶段排查进行中…',
  'stage.failed': '子任务未成功结束，可点「查看完整过程」定位原因',
  'stage.openFull': '查看完整过程 →',
  'stage.refs': '出处：{refs}',
  'stage.skipped': '跳过',
  'stage.more': '另有 {count} 个子任务',
}

/** English dictionary (same key set). */
export const en: Record<WorkflowViewKey, string> = {
  'run.title': '{name}',
  'run.members.one': '{count} subagent',
  'run.members.other': '{count} subagents',
  'phase.unassigned': 'Unphased',
  'phase.empty': 'Empty phase name',
  'status.running': 'Running',
  'status.completed': 'Completed',
  'status.failed': 'Failed',
  'status.cancelled': 'Cancelled',
  'status.interrupted': 'Interrupted',
  'member.open': 'Inspect the full run of {name}',
  'stage.loading': 'Loading stage findings…',
  'stage.running': 'Stage in progress…',
  'stage.failed': 'Stage ended abnormally — open the full run to inspect',
  'stage.openFull': 'Inspect full run →',
  'stage.refs': 'References: {refs}',
  'stage.skipped': 'Skipped',
  'stage.more': '{count} more subagents',
}

/** Union of this namespace's dictionary keys. */
export type WorkflowViewKey = keyof typeof zh
