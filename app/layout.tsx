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
      <body className="min-h-screen font-sans antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
