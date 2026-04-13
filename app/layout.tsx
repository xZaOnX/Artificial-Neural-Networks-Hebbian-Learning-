import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Hebbian Pattern Recall",
  description: "Interactive noisy pattern recall using Hebbian learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
