import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vår hälsa",
  description: "En hälsoplaneringsapp för par med AI-coaching och Bluetooth-synk",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        
        {/* iOS PWA fullscreen support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vår hälsa" />
        
        {/* Additional PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Vår hälsa" />
        
        {/* Prevent zoom on inputs */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased bg-gray-900 text-white font-sans">
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
