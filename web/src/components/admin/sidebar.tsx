'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthRole } from '@/hooks/useAuth';
import { Menu, X, Users, FileText, Home, ChevronLeft, ChevronRight } from 'lucide-react';
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
        className="md:hidden fixed top-4 left-4 z-50 text-white hover:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-[#121212] border-r border-white/10 transition-all duration-300 z-40',
          isOpen ? 'w-56' : 'w-16',
          'hidden md:block'
        )}
      >
        {/* Logo/Branding */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <div className={cn('font-bold text-[#E50914] transition-all', isOpen ? 'text-xl' : 'text-base')}>
            {isOpen ? 'SinhalaSub Admin' : 'SS'}
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
                      ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white',
                    !isOpen && 'justify-center px-0'
                  )}
                  title={!isOpen ? item.label : ''}
                >
                  {item.icon}
                  {isOpen && <span className="font-medium text-sm">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
              'text-gray-400 hover:bg-white/5 hover:text-white border border-white/10',
              !isOpen && 'justify-center px-0'
            )}
          >
            {isOpen ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="font-medium text-sm">Collapse</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
