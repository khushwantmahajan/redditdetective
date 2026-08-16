import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RedditDetective — Explore public Reddit activity",
    template: "%s · RedditDetective",
  },
  description:
    "RedditDetective is a premium Reddit activity explorer. Search a username to see public posts, comments, communities, and an evidence-backed AI summary — no login required.",
  metadataBase: new URL("https://redditdetective.app"),
  openGraph: {
    title: "RedditDetective — Explore public Reddit activity",
    description:
      "Search any Reddit username and explore public posts, comments, communities, and AI-powered insights backed by real evidence.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
