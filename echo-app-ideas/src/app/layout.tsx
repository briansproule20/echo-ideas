import Header from '@/app/_components/header';
import DotBackground from '@/components/ui/dot-background';
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
  title: 'Echo Ideas',
  description: 'AI-powered chat application with Echo billing integration',
  icons: {
    icon: '/favicon.ico',
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
        className={`${geistSans.variable} ${geistMono.variable} flex h-screen flex-col antialiased`}
      >
        <Providers>
          <DotBackground className="flex h-screen flex-col">
            <Header title="Echo App Idea Generator" />
            <div className="min-h-0 flex-1">{children}</div>
          </DotBackground>
        </Providers>
      </body>
    </html>
  );
}
