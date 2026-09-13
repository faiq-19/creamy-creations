import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { StoreProvider } from "@/components/cart";
import "./globals.css";
const sans = localFont({
  src: "../../public/fonts/dm-sans.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 1000",
  fallback: ["Arial"],
});
const serif = localFont({
  src: "../../public/fonts/cormorant-garamond.woff2",
  variable: "--font-serif",
  display: "optional",
  weight: "300 700",
  fallback: ["Georgia"],
  preload: false,
});
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Creamy Creations | Homemade cakes in Karachi",
    template: "%s | Creamy Creations",
  },
  description:
    "Personal celebration cakes, brownies and cupcakes, handmade in Karachi. Share your cake idea or order a little treat.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fffaf6",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <StoreProvider>
          <a href="#main" className="skip">
            Skip to content
          </a>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
