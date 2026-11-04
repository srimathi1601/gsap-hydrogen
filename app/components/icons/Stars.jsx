/**
 * Stars — the five-star rating glyph.
 *
 * Source: prototype/js/sections.js — the `/Stars` frames in SECTIONS.dtop
 * (96 x 17, five groups at a 19.2px stride) and SECTIONS.drev (106 x 19 in
 * the summary, 99 x 17 on each review card). The prototype ships every star
 * as its own clipped group; one repeated path at the same stride is
 * identical on screen and about 30x smaller.
 *
 * Filled with currentColor so each caller sets the ink.
 */

const STAR_PATH =
  'M8.47 0.5L10.55 5.72L16.16 6.1L11.85 9.72L13.22 15.18L8.47 12.17L3.72 15.18L5.09 9.72L0.78 6.1L6.39 5.72L8.47 0.5Z';

export const Stars = ({className, label}) => (
  <svg
    className={className}
    viewBox="0 0 96 17"
    fill="none"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : 'true'}
    focusable="false"
  >
    {[0, 1, 2, 3, 4].map((i) => (
      <path
        key={i}
        transform={`translate(${i * 19.2} 0)`}
        d={STAR_PATH}
        fill="currentColor"
      />
    ))}
  </svg>
);

export default Stars;
