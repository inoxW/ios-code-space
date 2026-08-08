import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ios-code-space",
  description: "Web-based coding workspace for iPhone, iPad, and desktop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
