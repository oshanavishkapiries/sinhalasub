'use client';

import { useQuery } from '@tanstack/react-query';
import { checkServiceHealth } from '../functions/admin-services';

export function useServiceHealthQuery(serviceUrl: string) {
  return useQuery({
    queryKey: ['service-health', serviceUrl],
    queryFn: async () => {
      const resp = await checkServiceHealth(serviceUrl);
      if (!resp.success) {
        throw new Error(resp.error || 'Failed to fetch service health');
      }
      return resp;
    },
    refetchInterval: 30000,
    retry: 1,
  });
}
