import { interpolate, Easing } from 'remotion';

// Soft editorial easing used across the piece.
export const ease = Easing.bezier(0.22, 1, 0.36, 1);

// 0→1 reveal starting at `start`, lasting `dur` frames.
export const reveal = (frame: number, start: number, dur = 16) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

// Fade + rise. Returns a style object.
export const fadeUp = (p: number, dy = 26): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dy}px)`,
});

// A scene-level opacity that fades in at the head and out at the tail.
export const sceneFade = (frame: number, dur: number, headDur = 14, tailDur = 14) =>
  interpolate(
    frame,
    [0, headDur, dur - tailDur, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear },
  );
