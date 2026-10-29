import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"], display: "swap" });
// Serif is only ever used in italic, for the sub-lines under display words.
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["italic"], display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KROMA — Steel Flasks & Glass Tableware in Pakistan",
  description:
    "Insulated steel flasks and bottles, drinking glasses and glass crockery. Order online, pay cash on delivery across Pakistan.",
};

export const viewport: Viewport = {
  themeColor: "#2341d6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${archivo.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
