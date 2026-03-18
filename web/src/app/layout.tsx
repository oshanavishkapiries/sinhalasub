import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import QueryProviders from "./providers";
import { LayoutClient } from "./layout-client";

export const metadata: Metadata = {
  title: "sinhalasub",
  description: "A modern streaming experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Source+Code+Pro:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "font-body antialiased min-h-screen bg-background flex flex-col",
        )}
        suppressHydrationWarning={true}
      >
        <QueryProviders>
          <LayoutClient>{children}</LayoutClient>
          <Toaster />
        </QueryProviders>
      </body>
    </html>
  );
}
