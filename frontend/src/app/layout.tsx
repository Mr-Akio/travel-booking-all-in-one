import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { CurrencyProvider } from "@/providers/CurrencyProvider"; 

const notoThai = Noto_Sans_Thai({ 
  subsets: ["latin", "thai"],
  variable: "--font-noto-thai",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${notoThai.variable} font-sans antialiased`}>
        <CurrencyProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </CurrencyProvider>
      </body>
    </html>
  );
}
