import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Developer AI Platform",
  description: "Access premium LLM models via our API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)] pt-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
