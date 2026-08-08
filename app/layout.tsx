import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Termux Online Studio",
  description: "A futuristic coding workspace with editor, terminal, projects, and built-in AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
