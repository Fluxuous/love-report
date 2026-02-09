import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Love Report — Where's the Gold?",
  description:
    "A Drudge Report-style news site that surfaces only the positive, uplifting news that matters today.",
  openGraph: {
    title: "Love Report",
    description: "Where's the Gold? Positive news that matters.",
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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
