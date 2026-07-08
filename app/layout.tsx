import type { Metadata } from "next";
import { Header } from "@/components/header";
import { siteConfig } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${siteConfig.storeName} | Pet Pickup Store`,
  description: siteConfig.tagline
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-20 font-sans antialiased sm:pb-0">
        <Header />
        {children}
      </body>
    </html>
  );
}
