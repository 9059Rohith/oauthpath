import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer } from "@/components/shell";
import "./globals.css";
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "OAuthPath — A clear path to launch",
    template: "%s | OAuthPath",
  },
  description:
    "Evidence-backed OAuth setup and approval guides. Understand the work, the wait, the blockers, and your next step.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://oauthpath.vercel.app",
  ),
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
