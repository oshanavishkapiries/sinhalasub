'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Search, Tv, Film, List, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { UserNav } from './user-nav';
import { Logo } from './logo';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tv-shows', label: 'TV Shows', icon: Tv },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/my-list', label: 'My List', icon: List },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-colors duration-300',
        isScrolled ? 'bg-background/90 backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-8" />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <Link href="/" className="mr-6 flex items-center space-x-2 px-6">
                  <Logo className="h-8" />
                </Link>
                <div className="my-4 h-px w-full bg-border" />
                <div className="flex flex-col space-y-2 px-6">
                    {navLinks.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                        'flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                        pathname === link.href ? 'bg-accent text-accent-foreground' : 'text-foreground'
                        )}
                    >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                    ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 md:hidden">
            <Link href="/" className="flex items-center">
               <Logo className="h-7" />
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
