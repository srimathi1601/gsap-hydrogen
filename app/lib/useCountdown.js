import {useEffect, useMemo, useState} from 'react';

/**
 * Deadline the announcement-bar countdown runs down to.
 * Keep the UTC offset in the string: without one the server (UTC) and the
 * browser (local) would parse it differently and disagree on the first render.
 */
export const COUNTDOWN_TARGET = '2026-11-09T05:12:05+01:00';

const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

function remaining(deadline) {
  const total = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
  return {
    days: pad(Math.floor(total / 86400)),
    hours: pad(Math.floor(total / 3600) % 24),
    minutes: pad(Math.floor(total / 60) % 60),
    seconds: pad(total % 60),
    done: total === 0,
  };
}

/**
 * Ticks once a second towards `target`, returning zero-padded parts.
 *
 * The first value is computed during render so SSR emits real numbers rather
 * than placeholders; the browser's own clock takes over on mount. Render the
 * numbers with suppressHydrationWarning, since the two will differ slightly.
 *
 * @param {string | number | Date} target
 */
export function useCountdown(target = COUNTDOWN_TARGET) {
  const deadline = useMemo(() => new Date(target).getTime(), [target]);
  const [left, setLeft] = useState(() => remaining(deadline));

  useEffect(() => {
    setLeft(remaining(deadline));
    const id = setInterval(() => setLeft(remaining(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return left;
}
