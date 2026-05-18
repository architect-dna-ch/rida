import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rida — Muslim Lifestyle App",
  description: "Salah planner, halal nutrition tracker, dhikr counter & Hifz tracker — all in one PWA.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Rida" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        {children}
        <script src="/sw-register.js" defer />
      </body>
    </html>
  );
}
