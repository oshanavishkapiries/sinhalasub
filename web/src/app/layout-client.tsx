'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';
import { ReactNode } from 'react';

export function LayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      <div className="flex-1">
        {children}
      </div>
      {!isAdminRoute && <Footer />}
    </>
  );
}
