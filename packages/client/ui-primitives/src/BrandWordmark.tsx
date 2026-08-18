// SEEAgent brand wordmark (text-only per user request — no icon mark):
// "SEE" word + "Agent" badge plate (ink plate, inverted text — black plate
// with white text in light theme). Canvas 84x24; ink rides currentColor and
// the badge text is knocked out in the inverted label color so the plate
// stays legible in both themes.

import type { IconProps } from './icons/props.ts'

/**
 * Render the full brand wordmark.
 * @param props.size - height in px (default 24; width keeps the 84:24 ratio).
 * @param props.className - extra class for layout placement.
 * @returns the wordmark svg (aria-hidden decorative brand art).
 */
export function BrandWordmark({ size = 24, className }: IconProps) {
  return (
    <svg
      width={(size * 84) / 24}
      height={size}
      className={className}
      viewBox="0 0 84 24"
      fill="none"
      aria-hidden="true"
    >
      <text
        x="1"
        y="17.5"
        fill="currentColor"
        fontSize="15"
        fontWeight="700"
        letterSpacing="0.5"
      >
        SEE
      </text>
      <rect x="45" y="5.25" width="38" height="13.5" rx="2" fill="currentColor" />
      <text
        x="64"
        y="15"
        textAnchor="middle"
        fill="var(--dsw-alias-label-primary-inverted)"
        fontSize="9"
        fontWeight="600"
        letterSpacing="0.5"
      >
        Agent
      </text>
    </svg>
  )
}
