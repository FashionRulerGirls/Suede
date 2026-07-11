'use client';
import React from 'react';

/* Scroll-reveal wrapper — fades + rises its contents into view as they
   enter the viewport (the smooth editorial feel of sites like phia.com).
   SSR-safe (renders hidden, reveals after mount) and honours
   prefers-reduced-motion. Use `delay` to stagger siblings. */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  y = 26,
  duration = 760,
  once = true,
  threshold = 0.14,
  className,
  style,
  ...rest
}: any) {
  const ref = React.useRef<any>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) { setShown(true); return; }
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(true); return; }
    // Already in view on mount (e.g. above the fold) → reveal on next frame.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { setShown(true); if (once) io.unobserve(e.target); }
        else if (!once) setShown(false);
      });
    }, { threshold, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translate3d(0, ${y}px, 0)`,
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
