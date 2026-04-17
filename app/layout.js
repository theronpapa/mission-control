import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mission Control - Exhibition Outreach Dashboard",
  description: "Orchestrate automated exhibition outreach: scrape leads, send invites, follow up, register with QR, generate video teasers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} antialiased min-h-screen bg-[#06060a]`}>
        {children}
      </body>
    </html>
  );
}
