"use client";

import { useEffect, useState } from "react";

/** The Dev bar's Pill editor switch, read from the root so an open popup follows it. Pills unless it is set to fields. */
export function useEditorStyle() {
  const [style, setStyle] = useState<string | undefined>(undefined);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setStyle(root.dataset.editorStyle);
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-editor-style"] });
    return () => observer.disconnect();
  }, []);
  return style;
}
