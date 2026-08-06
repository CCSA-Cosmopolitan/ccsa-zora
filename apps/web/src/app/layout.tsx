import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "@ccsa-zora/ui/globals.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CCSA Zora | Agricultural Super Intelligence",
  description:
    "A multilingual, voice-enabled agricultural companion for climate-smart farming, field intelligence, and trusted extension services.",
  applicationName: "CCSA Zora",
  icons: {
    icon: "/brand/zora-square.jpeg",
    apple: "/brand/zora-square.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
