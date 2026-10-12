import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "AskWise AI",
  description:
    "Upload PDF and TXT documents and ask questions with AI-powered document retrieval.",
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