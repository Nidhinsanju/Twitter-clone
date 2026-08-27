import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FeedProvider } from "@/context/FeedContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ComposeModalProvider } from "@/context/ComposeModalContext";
import AppShell from "@/components/layout/AppShell";

const chirp = Inter({
  variable: "--font-chirp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Twitter Clone",
  description: "A pixel-close Twitter/X UI clone built with Next.js and Tailwind CSS.",
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'dark' || stored === 'light' ? stored : 'light';
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${chirp.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="h-full antialiased">
        <ThemeProvider>
          <FeedProvider>
            <ComposeModalProvider>
              <AppShell>{children}</AppShell>
            </ComposeModalProvider>
          </FeedProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
