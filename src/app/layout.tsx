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
  title: "Om Gorakhia — I turn messy data into systems that decide.",
  description:
    "Business Analyst, Data Scientist, and ML Engineer building autonomous AI systems. Currently pursuing MSBA at NUS Singapore.",
  metadataBase: new URL("https://portfolio-build-kohl.vercel.app"),
  openGraph: {
    title: "Om Gorakhia — I turn messy data into systems that decide.",
    description:
      "Business Analyst, Data Scientist, and ML Engineer. NUS MSBA. Building algo trading systems, agentic AI, and data pipelines that deliver $2M+ in client insights.",
    type: "website",
    locale: "en_US",
    siteName: "Om Gorakhia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Om Gorakhia — I turn messy data into systems that decide.",
    description:
      "Business Analyst, Data Scientist, and ML Engineer. NUS MSBA. Building autonomous AI systems.",
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
