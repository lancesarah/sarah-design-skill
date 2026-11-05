import type { ReactNode } from "react";
import { AppShell } from "./shell";
import "./screens.css";

const PAGE_LIMIT_SCRIPT = `try{var sideChosen=sessionStorage.getItem("side-chosen")==="1";var sideHeldOpen=sessionStorage.getItem("side-held-open")==="1";document.body.classList.add("app-shell");if((window.innerWidth<1564&&!sideHeldOpen)||sideChosen)document.body.classList.add("is-side-collapsed");if(window.innerWidth<1341)document.body.classList.add("is-lance-collapsed")}catch(e){}`;

export default function ScreensLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PAGE_LIMIT_SCRIPT }} />
      <AppShell>{children}</AppShell>
    </>
  );
}
