import Header from '@/app/_components/header';
import DotBackground from '@/components/ui/dot-background';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/providers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Echo App Idea Generator',
  description: 'Generate innovative app ideas powered by Echo\'s AI infrastructure',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-screen flex-col antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Providers>
            <DotBackground className="flex h-screen flex-col">
              <Header />
              <div className="min-h-0 flex-1">{children}</div>
            </DotBackground>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
