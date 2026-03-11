'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context';
import { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      {/* Main content - responsive margin that matches sidebar width */}
      <div 
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          isOpen ? 'md:ml-56' : 'md:ml-16'
        )}
      >
        {/* Header */}
        <AdminHeader />
        
        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
