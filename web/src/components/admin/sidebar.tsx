'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, Users, Home, Film, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/sidebar-context';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function AdminSidebar() {
  const { isOpen, toggle } = useSidebar();
  const pathname = usePathname();

  const menuItems: SidebarItem[] = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: '/admin/movies',
      label: 'Movies',
      icon: <Film className="w-5 h-5" />,
    },
    {
      href: '/admin/tv-series',
      label: 'TV Series',
      icon: <Tv className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 text-foreground hover:bg-white/10"
        onClick={toggle}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-background border-r border-border z-40',
          'w-56 hidden md:block'
        )}
      >
        {/* Logo/Branding */}
        <div className="h-16 flex items-center justify-center px-4 border-b border-border">
          <div className="w-[120px] h-12">
            <Image
              src="/logo.png"
              alt="SinhalaSub Logo"
              width={120}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/admin');
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer',
                    isActive 
                      ? 'bg-primary text-foreground shadow-lg shadow-primary/20' 
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  )}
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 md:hidden z-30"
          onClick={toggle}
        />
      )}
    </>
  );
}
