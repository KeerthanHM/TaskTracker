import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata: Metadata = {
  title: "Tasks Tracker — Stay organized with tasks, your way",
  description: "A modern, real-time task management app with workspaces, team availability, subtasks, and optimistic UI. Built by Keerthan H M.",
  keywords: ["task tracker", "project management", "team collaboration", "workspace", "productivity"],
  openGraph: {
    title: "Tasks Tracker",
    description: "Stay organized with tasks, your way.",
    type: "website",
    url: "https://taskstracker.online",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                if (t) document.documentElement.setAttribute('data-theme', t);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
