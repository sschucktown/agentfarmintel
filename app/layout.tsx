import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Farm Intel",
  description: "Static Apify export report preview for Agent Farm Intel"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
