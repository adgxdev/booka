// app/fonts.ts
import localFont from "next/font/local";

export const boldFont = localFont({
  src: [
    {
        path: "../public/fonts/grifterbold.otf",
        weight: "300 900",
        style: "bold",
    },
  ],
  variable: "--font-bold",
  display: "swap",
});