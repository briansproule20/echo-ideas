import Header from '@/app/_components/header';
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
    icon: '/echo-ideas favicon.png',
    shortcut: '/echo-ideas favicon.png',
    apple: '/echo-ideas favicon.png',
  },
  openGraph: {
    title: 'Echo Ideas',
    description: 'AI-powered chat application with Echo billing integration',
    images: ['/echo-ideas favicon.png'],
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
          <Header title="Echo Ideas" />
          <div className="min-h-0 flex-1">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
