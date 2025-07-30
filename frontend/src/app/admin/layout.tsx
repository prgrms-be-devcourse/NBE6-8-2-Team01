import { Geist, Geist_Mono } from "next/font/google";
import "../bookbook/globals.css";
import ContextLayout from "./contextLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <ContextLayout>{children}</ContextLayout>
      </body>
    </html>
  );
}
