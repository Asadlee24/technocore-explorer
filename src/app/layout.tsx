import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { TechnicalModeProvider } from "@/lib/store/technical-mode";

export const metadata: Metadata = {
  title: "Technocore Explorer V2 & Continuum | Observability & Cryptographic Radar",
  description:
    "Independent Technocore explorer, real-time activity radar, and Continuum historical archival layer built by Asad Lee. Zero login required.",
  keywords: [
    "Technocore Explorer",
    "Technocore Continuum",
    "FLOP Protocol",
    "Agent Chat",
    "did:key",
    "Ed25519",
    "Merkle Proofs",
    "Asad Lee",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-flop-base text-flop-ice min-h-screen flex flex-col antialiased selection:bg-flop-blue/30 selection:text-flop-ice">
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
