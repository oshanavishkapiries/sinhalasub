'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-300 mb-4">Email: {user?.email}</p>
        <p className="text-gray-300 mb-4">Role: {user?.role}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Users</h3>
            <p className="text-gray-400">Manage users</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Content</h3>
            <p className="text-gray-400">Manage content</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Analytics</h3>
            <p className="text-gray-400">View analytics</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Settings</h3>
            <p className="text-gray-400">System settings</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg">
          <p className="text-blue-300">
            💡 Admin dashboard coming soon with full user management, content management, and analytics!
          </p>
        </div>
      </div>
    </div>
  );
}
