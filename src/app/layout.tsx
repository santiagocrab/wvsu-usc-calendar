import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "WVSU USC Unified Calendar AY 2026–2027",
  description: "West Visayas State University University Student Council Unified Calendar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${figtree.variable}`}>
      <body className={`${figtree.className} min-h-full antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
