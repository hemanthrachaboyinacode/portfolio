import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hemanth Rachaboyina | AI Engineer",
  description: "Building intelligent systems with agentic AI, RAG, and language models.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
