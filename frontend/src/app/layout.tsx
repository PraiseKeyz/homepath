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
