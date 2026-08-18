// SEE branding: per user request the icon mark is removed entirely — the hero
// and the collapsed rail render no logo. The component (and its IconProps
// surface) is kept so call sites stay untouched.

import type { IconProps } from './icons/props.ts'

/**
 * Render the logo mark. Currently renders nothing (icon removed by request).
 * @param props.size - ignored.
 * @param props.className - ignored.
 * @returns null.
 */
export function FishLogo({ size: _size, className: _className }: IconProps) {
  return null
}
