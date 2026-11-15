import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALU dApp",
  description: "Decentralized application for ALU logo registration and verification.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50">
        {children}
      </body>
    </html>
  );
}
