'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { UserRole } from '@/types/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
      <div className="min-h-screen bg-background">
        {/* Admin Layout content will go here */}
        {children}
      </div>
    </ProtectedRoute>
  );
}
