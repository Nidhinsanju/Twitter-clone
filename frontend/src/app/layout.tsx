import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { FeedProvider } from "@/context/FeedContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ComposeModalProvider } from "@/context/ComposeModalContext";
import AuthGate from "@/components/layout/AuthGate";

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
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="h-full antialiased">
        <ThemeProvider>
          <AuthProvider>
            <FeedProvider>
              <ComposeModalProvider>
                <AuthGate>{children}</AuthGate>
              </ComposeModalProvider>
            </FeedProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
