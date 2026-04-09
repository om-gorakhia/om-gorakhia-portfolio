import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { PageTransition } from "@/components/PageTransition";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "om.sys — Operator Console",
  description:
    "Om Gorakhia — I turn messy data into systems that decide. Algo trading, agentic AI, quantitative modeling. NUS MSBA.",
  metadataBase: new URL("https://portfolio-build-kohl.vercel.app"),
  openGraph: {
    title: "om.sys — Operator Console",
    description:
      "Om Gorakhia — I turn messy data into systems that decide. Algo trading, agentic AI, quantitative modeling, and data pipelines that deliver $2M+ in client insights.",
    type: "website",
    locale: "en_US",
    siteName: "om.sys",
  },
  twitter: {
    card: "summary_large_image",
    title: "om.sys — Operator Console",
    description:
      "Om Gorakhia — I turn messy data into systems that decide. NUS MSBA. Algo trading, agentic AI, quantitative modeling.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
