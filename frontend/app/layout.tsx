import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { boldFont } from "./font";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "300", "400", "600", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Booka – Order Textbooks with Ease, Not Queues",
  description:
    "Booka is an independent textbook ordering and delivery platform for African universities. Students can browse, pay, and receive textbooks, no more long queues, cash-only payments, or bookshop stress.",
  keywords: [
    "Booka",
    "Booka App",
    "Booka Campus",
    "BookaCampus",
    "Booka Nigeria",
    "Booka Africa",
    "Booka It",
    "digital textbook platform",
    "textbook delivery",
    "university textbooks Africa",
    "digital bookstore",
    "education technology Nigeria",
    "student bookstore app",
    "Booka for universities",
  ],
  openGraph: {
    title: "Booka – Simplifying Textbook Access for African Students",
    description:
      "Booka transforms how African students get textbooks—making it easy to search, purchase, and receive books with a seamless digital experience, all in one platform.",
    url: "https://www.bookacampus.com",
    siteName: "Booka",
    images: [
      {
        url: "https://www.bookacampus.com/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Booka – Textbook Ordering & Delivery Platform for African Universities",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booka – Order Textbooks with Ease, Not Queues",
    description:
      "Experience the smarter way to get textbooks. Browse, pay, and receive your school books — all through Booka.",
    images: ["https://www.bookacampus.com/images/og-image.jpg"],
  },
  metadataBase: new URL("https://www.bookacampus.com"),
  alternates: {
    canonical: "https://www.bookacampus.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} ${boldFont.variable} antialiased`}
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