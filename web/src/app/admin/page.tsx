'use client';

import { ServiceStatusCard } from '@/components/admin/services/service-status-card';

const SERVICES = [
  { name: 'Main Service', url: 'http://localhost:5001' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor microservices health status</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Service Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SERVICES.map((service) => (
            <ServiceStatusCard key={service.url} name={service.name} url={service.url} />
          ))}
        </div>
      </div>
    </div>
  );
}
