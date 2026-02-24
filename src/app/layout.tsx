import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FloatingTelegram from "./components/FloatingTelegram";
import React from "react";

const ptRootUI = localFont({
  src: [
    {
      path: "../../public/fonts/PT_Root_UI_Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/PT_Root_UI_Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/PT_Root_UI_Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/PT_Root_UI_Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pt-root-ui",
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#E1DDD6",
  colorScheme: "light",
  // Helps with keyboard layout shifts on mobile
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "StaySee - Одежда для поваров",
  description: "Одежда для ресторанов и поваров. Продажа физическим и юридическим лицам.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/images/logo/StaySee_Logo_chocolate_v1-0.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StaySee",
  },
  formatDetection: {
    telephone: false,
  },
};

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={ptRootUI.variable}>
      <head>
        <link rel="preload" href="/videos/hero-inline.mp4" as="video" type="video/mp4" />
      </head>
      <body
        className={`${ptRootUI.className} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
        <FloatingTelegram />
      </body>
    </html>
  );
}
