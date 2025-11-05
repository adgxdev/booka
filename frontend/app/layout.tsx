import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { boldFont } from "./font";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booka",
  description: "Booka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} ${geistMono.variable} ${boldFont.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" toastOptions={{
            duration: 3000,
            style: {
              background: "#00C6FF",
              color: "#fff",
              fontSize: "0.875rem", // text-sm
              borderRadius: "0.375rem", // rounded-md
              padding: "8px 14px",
            },
            success: {
              iconTheme: {
                primary: "#FFD166",
                secondary: "#00C6FF",
              },
            },
          }} />
      </body>
    </html>
  );
}