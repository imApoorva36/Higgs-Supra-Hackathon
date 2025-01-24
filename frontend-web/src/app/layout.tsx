import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppProvider from "../components/provider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BOX3",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider session={session}>{children}</AppProvider>
      </body>
    </html>
  );
}
