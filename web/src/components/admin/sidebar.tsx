'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthRole } from '@/hooks/useAuth';
import { Menu, X, Users, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);
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
      href: '/admin/content',
      label: 'Content',
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 z-40',
          isOpen ? 'w-64' : 'w-20',
          'hidden md:block'
        )}
      >
        {/* Logo/Branding */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <div className={cn('font-bold text-red-600', isOpen ? 'text-2xl' : 'text-sm')}>
            {isOpen ? 'Admin' : 'A'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size={isOpen ? 'lg' : 'icon'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-red-600 hover:bg-red-700'
                  )}
                  title={item.label}
                >
                  {item.icon}
                  {isOpen && <span className="ml-2">{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button
            variant="outline"
            size={isOpen ? 'lg' : 'icon'}
            className="w-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <>
                <X className="w-4 h-4" />
                <span className="ml-2">Collapse</span>
              </>
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
