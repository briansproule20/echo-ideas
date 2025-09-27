import { EchoAccount } from '@/components/echo-account-next';
import { isSignedIn } from '@/echo';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: FC<HeaderProps> = async ({
  title = 'My App',
  className = '',
}) => {
  const signedIn = await isSignedIn();

  return (
    <header
      className={`border-gray-200 border-b bg-white shadow-sm ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/echo-ideas favicon.png"
              alt="Echo Ideas"
              width={32}
              height={32}
              className="mr-3"
            />
            <h1 className="font-semibold text-gray-900 text-xl">{title}</h1>
          </div>

          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 transition-colors hover:text-gray-900"
            >
              Chat
            </Link>
            <Link
              href="/ideas"
              className="text-gray-600 transition-colors hover:text-gray-900"
            >
              Ideas
            </Link>
            <EchoAccount />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
