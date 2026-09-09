import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// https://nextjs.org/docs/app/api-reference/components/font
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: "KlevenBook",
  description: "Invoicing for small Indian distributors",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={plex.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
