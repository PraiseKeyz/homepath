import type { Metadata } from "next";
import "./styles/globals.css";

const description =
  "HomePath connects Nigeria's housing-deficit households to verified land records, cooperative savings, and demand-matched developers.";

export const metadata: Metadata = {
  title: {
    default: "HomePath — Inclusive Housing Access",
    template: "%s | HomePath",
  },
  description,
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/favicon-512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
