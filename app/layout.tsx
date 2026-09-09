import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// https://nextjs.org/docs/app/api-reference/components/font
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: { default: "KlevenBook", template: "%s · KlevenBook" },
  description: "Invoicing for small Indian distributors",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0f2a52" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={plex.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
