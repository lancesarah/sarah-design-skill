import type { ReactNode } from "react";
import { Libre_Baskerville } from "next/font/google";
import { VercelToolbar } from "@vercel/toolbar/next";
import "./globals.css";
import "./docs.css";
import "./comments.css";
import { CommentLayer } from "./comments";
import { DevBadge } from "./dev-badge";
import { SpacingTool } from "./spacing-tool";

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
      </head>
      <body className={serif.variable}>
        {children}
        <DevBadge />
        <SpacingTool />
        <CommentLayer />
        {process.env.NODE_ENV === "development" ? <VercelToolbar /> : null}
      </body>
    </html>
  );
}
