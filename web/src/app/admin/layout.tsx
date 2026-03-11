'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { UserRole } from '@/types/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        
        <div className="md:ml-20 flex flex-col">
          {/* Header */}
          <AdminHeader />
          
          {/* Page content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
