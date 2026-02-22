import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

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
      <body className={GeistSans.className}>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </Providers>
      </body >
    </html >
  );
}
