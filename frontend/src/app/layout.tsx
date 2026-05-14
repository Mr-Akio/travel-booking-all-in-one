import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { CurrencyProvider } from "@/providers/CurrencyProvider"; 

const inter = Inter({ 
  subsets: ["latin", "thai"],
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CurrencyProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </CurrencyProvider>
      </body>
    </html>
  );
}
