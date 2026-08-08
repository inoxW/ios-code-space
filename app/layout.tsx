import type { Metadata } from "next";
import Link from "next/link";
import { ProjectProvider } from "@/lib/project-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Replit - Code Space",
  description: "Browser coding workspace — editor, console, Python, dependency guess.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="flex flex-col h-screen">
        <ProjectProvider>
          <header className="border-b border-white/10 bg-[#1e1e1e] h-14 flex items-center px-4 gap-4">
            <Link
              href="/"
              className="font-bold text-base tracking-tight text-white flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded"></div>
              Replit
            </Link>
            <div className="flex-1 flex gap-2">
              <Link
                href="/"
                className="text-xs text-gray-400 hover:text-white transition px-2 py-1"
              >
                Home
              </Link>
              <Link
                href="/editor"
                className="text-xs text-gray-400 hover:text-white transition px-2 py-1"
              >
                Editor
              </Link>
              <Link
                href="/projects"
                className="text-xs text-gray-400 hover:text-white transition px-2 py-1"
              >
                Projects
              </Link>
            </div>
          </header>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </ProjectProvider>
      </body>
    </html>
  );
}
