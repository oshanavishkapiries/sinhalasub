'use client';

import { useServiceHealthQuery } from '@/services/hooks/useAdminServices';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, Server, Cpu, HardDrive, Clock, RefreshCw } from 'lucide-react';

interface ServiceStatusCardProps {
  name: string;
  url: string;
}

export function ServiceStatusCard({ name, url }: ServiceStatusCardProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, error, isFetching } = useServiceHealthQuery(url);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['service-health', url] });
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-500';
      case 'DEGRADED':
        return 'bg-yellow-500';
      case 'ERROR':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">{name}</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Checking...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-sm text-red-400">Offline</span>
          </div>
        ) : data?.data ? (
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(data.data.status)}`} />
            <span className="text-sm text-green-400">{data.data.status}</span>
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="ml-2 p-1 hover:bg-background rounded transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-400">Unable to connect to service</p>
          <p className="text-xs text-muted-foreground mt-1">{url}</p>
        </div>
      ) : data?.data?.metrics ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded p-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Cpu className="h-3 w-3" />
                CPU
              </div>
              <p className="text-sm font-medium text-foreground">
                {data.data.metrics.cpu.usage_percent.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {data.data.metrics.cpu.cores} cores
              </p>
            </div>
            <div className="bg-background rounded p-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <HardDrive className="h-3 w-3" />
                Memory
              </div>
              <p className="text-sm font-medium text-foreground">
                {data.data.metrics.memory.used_percent.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(data.data.metrics.memory.used_bytes)} / {formatBytes(data.data.metrics.memory.total_bytes)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{data.data.version}</span>
            </div>
            <span>{formatTimestamp(data.data.timestamp)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
