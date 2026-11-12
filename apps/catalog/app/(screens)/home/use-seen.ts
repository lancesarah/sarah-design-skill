"use client";

import { useEffect, useRef, useState } from "react";

/** True from the first time half the node is on screen. A chart fills then, not below the fold. */
export function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setSeen(true);
        watch.disconnect();
      },
      { threshold: 0.5 },
    );
    watch.observe(node);
    return () => watch.disconnect();
  }, []);

  return { ref, seen };
}
