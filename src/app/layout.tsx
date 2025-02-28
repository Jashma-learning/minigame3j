import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProgressProvider } from "../contexts/GameProgressContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cognitive Assessment Games",
  description: "A series of cognitive assessment games for children",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}</style>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <GameProgressProvider>
          {children}
        </GameProgressProvider>
      </body>
    </html>
  );
}
