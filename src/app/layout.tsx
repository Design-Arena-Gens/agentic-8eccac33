import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Arcana Atelier – Tarot de Marseille",
  description:
    "Un atelier interactif pour explorer le Tarot de Marseille avec tirages en 3D, animations raffinées et préparation pour l'interprétation assistée par IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body data-theme="light">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
