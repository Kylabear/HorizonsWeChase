import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Horizons We Chase",
  description:
    "A shared bucket list of places to visit — restaurants, cafés, and horizons for two.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Horizons We Chase",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#f7f1e8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full min-h-dvh flex-col antialiased" suppressHydrationWarning>
        <Providers>
          <NavBar />
          <main className="w-full flex-1 overflow-x-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
