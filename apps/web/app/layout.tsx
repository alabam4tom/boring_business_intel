import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://boringbusinessintel.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "BoringBusinessIntel — Financial Benchmarks for Digital Agencies",
    template: "%s | BoringBusinessIntel",
  },
  description:
    "Anonymous peer benchmarking for digital agencies. Compare your revenue growth, gross margin, and net margin against 30+ similar agencies in your exact segment — size, region, and service type.",
  keywords: [
    "digital agency benchmarks",
    "agency financial KPIs",
    "revenue growth benchmark",
    "gross margin benchmark",
    "net margin benchmark",
    "agency performance metrics",
    "peer benchmarking SaaS",
    "anonymous financial data",
    "k-anonymity",
  ],
  authors: [{ name: "BoringBusinessIntel", url: APP_URL }],
  creator: "BoringBusinessIntel",
  publisher: "BoringBusinessIntel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "BoringBusinessIntel",
    title: "BoringBusinessIntel — Financial Benchmarks for Digital Agencies",
    description:
      "Anonymous peer benchmarking for digital agencies. Compare your revenue growth, gross margin, and net margin against 30+ similar agencies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BoringBusinessIntel — Financial Benchmarks for Digital Agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BoringBusinessIntel — Financial Benchmarks for Digital Agencies",
    description:
      "Anonymous peer benchmarking for digital agencies. Compare revenue growth, gross margin, and net margin against 30+ peers.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
