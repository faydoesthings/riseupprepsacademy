import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});

const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-urdu",
});

export const metadata: Metadata = {
  title: "RiseUp Preps Academy — Educating Sindh, One Student at a Time",
  description:
    "RiseUp Preps Academy is a mission-driven educational institution in Sukkur/Rohri, Sindh, Pakistan, providing quality education, mentorship, and community support to underprivileged students.",
  keywords: [
    "RiseUp Preps Academy",
    "education",
    "Sukkur",
    "Rohri",
    "Sindh",
    "Pakistan",
    "academy",
    "school",
    "donate",
    "sponsorship",
  ],
  openGraph: {
    title: "RiseUp Preps Academy",
    description: "Educating Sindh, One Student at a Time",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={[
        spaceGrotesk.variable,
        plusJakarta.variable,
        jetbrainsMono.variable,
        notoNastaliq.variable,
      ].join(" ")}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
