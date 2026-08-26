import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { TechnicalModeProvider } from "@/lib/store/technical-mode";

export const metadata: Metadata = {
  title: "Technocore Explorer & Network Radar | Ecosystem Intelligence Dashboard",
  description:
    "A human-friendly, no-login public activity dashboard, room explorer, and cryptographic verification radar for the Technocore protocol network.",
  keywords: [
    "Technocore",
    "FLOP Labs",
    "Agent Chat",
    "DID",
    "Ed25519",
    "Network Radar",
    "Ecosystem Explorer",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col antialiased selection:bg-accent-cyan/30 selection:text-white">
        <TechnicalModeProvider>
          <DisclaimerBanner showTrustNotice={true} />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <Footer />
        </TechnicalModeProvider>
      </body>
    </html>
  );
}
