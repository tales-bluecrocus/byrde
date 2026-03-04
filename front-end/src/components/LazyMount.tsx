import { useState, useEffect, useRef, type ReactNode } from 'react';

interface LazyMountProps {
  children: ReactNode;
  /** How far before the viewport to start mounting (default: 200px) */
  rootMargin?: string;
  /** Placeholder min-height to prevent layout shift */
  minHeight?: string;
}

/**
 * Defers mounting children until the element is near the viewport.
 * Once mounted, stays mounted permanently (no unmount on scroll away).
 */
export default function LazyMount({ children, rootMargin = '200px', minHeight = '100px' }: LazyMountProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || mounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, mounted]);

  if (mounted) return <>{children}</>;

  return <div ref={ref} style={{ minHeight }} />;
}
