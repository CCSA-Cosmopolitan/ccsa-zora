import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "@ccsa-zora/ui/globals.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Zora — Your farming companion",
  description:
    "Ask about your farm in Hausa, Yorùbá, Igbo, Pidgin or English. Voice-first farming guidance from Zora, developed by CCSA.",
  applicationName: "CCSA Zora",
  icons: {
    icon: "/ccsa-logo.png",
    apple: "/ccsa-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
