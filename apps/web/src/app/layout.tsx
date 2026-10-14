import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "@ccsa-zora/ui/globals.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CCSA Zora — Sovereign Agricultural Intelligence | Cosmopolitan University Abuja",
  description:
    "Centre for Climate-Smart Agriculture (CCSA) at Cosmopolitan University Abuja. Sovereign agricultural AI, multilingual extension in Hausa, Yorùbá, Igbo, and Pidgin, and verified digital MRV.",
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
