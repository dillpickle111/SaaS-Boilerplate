'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { Logo } from '@/templates/Logo';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/app' },
    { name: 'Question Bank', href: '/questions' },
    { name: 'Practice', href: '/practice' },
    { name: 'Progress', href: '/dashboard/progress' },
  ];

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === '/app';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/app" className="flex items-center">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <div className="ml-10 hidden md:block">
              <div className="flex items-baseline space-x-4">
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center space-x-4">
            {/* Desktop User Controls */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <LocaleSwitcher />
              <UserButton
                userProfileMode="navigation"
                userProfileUrl="/dashboard/user-profile"
                appearance={{
                  elements: {
                    rootBox: 'px-2 py-1.5',
                  },
                }}
              />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Mobile User Controls */}
          <div className="border-t border-gray-200 px-2 py-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <LocaleSwitcher />
              <UserButton
                userProfileMode="navigation"
                userProfileUrl="/dashboard/user-profile"
                appearance={{
                  elements: {
                    rootBox: 'px-2 py-1.5',
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 