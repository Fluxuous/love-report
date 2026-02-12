import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOVE REPORT",
  description: "All the news that's fit to love.",
  openGraph: {
    title: "LOVE REPORT",
    description: "All the news that's fit to love.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
