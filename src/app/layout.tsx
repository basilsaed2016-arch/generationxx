import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "700", "800"],
  preload: true,
});

const ibmPlex = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "GenerationX Roleplay | تجربة رول بلاي فاخرة داخل عالم FiveM",
  description:
    "GenerationX Roleplay — أفضل تجربة رول بلاي داخل عالم FiveM. حياة واقعية، وظائف، أعمال، سيارات، وسكربتات حصرية في مدينة سينمائية واحدة.",
  keywords: [
    "GenerationX",
    "رول بلاي",
    "FiveM",
    "العاب",
    "مدينة",
    "Discord",
    "سيرفر عربي",
  ],
  authors: [{ name: "GenerationX Roleplay" }],
  icons: {
    icon: "/gx-logo-transparent.webp",
  },
  openGraph: {
    title: "GenerationX Roleplay",
    description: "تجربة رول بلاي فاخرة داخل عالم FiveM.",
    siteName: "GenerationX",
    type: "website",
    locale: "ar_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "GenerationX Roleplay",
    description: "تجربة رول بلاي فاخرة داخل عالم FiveM.",
  },
};

export const viewport: Viewport = {
  themeColor: "#090909",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <body
        className={`${cairo.variable} ${tajawal.variable} ${ibmPlex.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Sonner position="top-center" richColors />
      </body>
    </html>
  );
}
