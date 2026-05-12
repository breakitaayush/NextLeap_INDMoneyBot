import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ayuva | AI Wellbeing Companion",
  description:
    "Ayuva is your personal AI companion for habits, mood, stress, sleep, and daily wellbeing."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem("ayuva-theme") || "light";
                document.documentElement.classList.toggle("dark", theme === "dark");
              } catch (error) {}
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
