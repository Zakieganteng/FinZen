import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import LayoutWrapper from "./components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FinZen - Web Pengelolaan Keuangan Gen Z",
  description: "Aplikasi web untuk membantu Gen Z mengelola keuangan pribadi dengan sistem streak dan gamifikasi",
  openGraph: {
    title: "FinZen - Web Pengelolaan Keuangan Gen Z",
    description: "Aplikasi web untuk membantu Gen Z mengelola keuangan pribadi dengan sistem streak dan gamifikasi",
    images: ['/Logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FinZen - Web Pengelolaan Keuangan Gen Z",
    description: "Aplikasi web untuk membantu Gen Z mengelola keuangan pribadi dengan sistem streak dan gamifikasi",
    images: ['/Logo.png'],
  },
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="finzen-theme" strategy="beforeInteractive">
          {`
            try {
              var saved = localStorage.getItem('finzen-theme');
              var theme = saved || 'light';
              if (theme === 'dark') document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            } catch (e) {}
          `}
        </Script>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
