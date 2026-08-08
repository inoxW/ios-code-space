import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ProjectProvider } from "@/lib/project-context";
import { ServiceWorkerRegister } from "./service-worker-register";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Replit - Code Space",
  description: "Browser coding workspace — editor, console, Python, dependency guess.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Replit",
  },
  formatDetection: {
    telephone: false,
  },
  icons: [
    {
      rel: "icon",
      type: "image/svg+xml",
      url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%23ff6b35' width='192' height='192'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='120' font-weight='bold' fill='white' font-family='system-ui'>▶</text></svg>",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="flex flex-col h-screen">
        <ServiceWorkerRegister />
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
