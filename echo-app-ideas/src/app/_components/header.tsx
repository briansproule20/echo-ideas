'use client';

import { EchoAccount } from '@/components/echo-account-next';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Echo App Idea Generator', className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className={`border-gray-200 dark:border-gray-800 border-b bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-sm ${className || ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/icon.png"
                  alt="Echo Ideas"
                  width={32}
                  height={32}
                  className="mr-3 flex-shrink-0"
                />
                <span className="hidden sm:block font-semibold text-gray-900 dark:text-white text-lg">
                  Echo App Ideas
                </span>
              </Link>
            </div>

            {/* Navigation - ThemeToggle + EchoAccount + Hamburger */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <EchoAccount />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-black shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <span className="font-semibold text-gray-900 dark:text-white text-lg">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              href="/"
              className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/ideas"
              className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Ideas
            </Link>
            <Link
              href="/saved"
              className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Saved
            </Link>
            <Link
              href="/chat"
              className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Chat
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;