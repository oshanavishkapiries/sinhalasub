'use client';

import { useAuth } from '@/hooks/useAuth';
import { Users, FileText, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Users',
      description: 'Manage system users',
      icon: <Users className="h-8 w-8" />,
      href: '/admin/users',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Content',
      description: 'Manage movies & TV shows',
      icon: <FileText className="h-8 w-8" />,
      href: '/admin/content',
      color: 'from-primary to-accent',
    },
    {
      title: 'Analytics',
      description: 'View statistics',
      icon: <BarChart3 className="h-8 w-8" />,
      href: '#',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: <Settings className="h-8 w-8" />,
      href: '#',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-8 shadow-lg shadow-primary/20">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-foreground/90 text-lg">
          {user?.email} • <span className="capitalize">{user?.role}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <div className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/10">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} text-foreground mb-4`}>
                {stat.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {stat.title}
              </h3>
              <p className="text-muted-foreground text-sm">{stat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-card border border-primary/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-primary text-2xl">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Full Admin Dashboard Active
            </h3>
            <p className="text-muted-foreground">
              You now have access to complete user management, content management with CRUD operations, 
              bulk actions, advanced filtering, and real-time search capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
