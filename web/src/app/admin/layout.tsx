'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { AdminTopbarProvider } from '@/contexts/admin-topbar-context';
import { UserRole } from '@/types/auth';
import { useSidebar } from '@/contexts/sidebar-context';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { toggle } = useSidebar();
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      {/* Main content */}
      <div className="flex flex-col min-h-screen md:ml-56">
        {/* Header */}
        <AdminHeader onToggleSidebar={toggle} />
        
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
        <AdminTopbarProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminTopbarProvider>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
