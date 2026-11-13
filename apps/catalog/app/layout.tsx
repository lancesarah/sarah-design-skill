import type { ReactNode } from "react";
import { Libre_Baskerville, Plus_Jakarta_Sans } from "next/font/google";
import { VercelToolbar } from "@vercel/toolbar/next";
import "./globals.css";
import "./docs.css";
import { DevBadge } from "./dev-badge";
import { SpacingTool } from "./spacing-tool";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const serif = Libre_Baskerville({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata = {
  title: "Gallery UI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600&display=swap" />
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("font")!=="jakarta")document.documentElement.dataset.font="switzer"}catch(e){}`,
          }}
        />
      </head>
      <body className={`${sans.variable} ${serif.variable}`}>
        {children}
        <DevBadge />
        <SpacingTool />
        {process.env.NODE_ENV === "development" ? <VercelToolbar /> : null}
      </body>
    </html>
  );
}
