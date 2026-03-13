'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type AdminTopbarSearchConfig = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

type AdminTopbarContextValue = {
  search: AdminTopbarSearchConfig | null;
  setSearch: (config: AdminTopbarSearchConfig | null) => void;
  clearSearch: () => void;
};

const AdminTopbarContext = createContext<AdminTopbarContextValue | undefined>(undefined);

export function AdminTopbarProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearchState] = useState<AdminTopbarSearchConfig | null>(null);

  const setSearch = useCallback((config: AdminTopbarSearchConfig | null) => {
    setSearchState(config);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState(null);
  }, []);

  const value = useMemo(
    () => ({
      search,
      setSearch,
      clearSearch,
    }),
    [search, setSearch, clearSearch]
  );

  return <AdminTopbarContext.Provider value={value}>{children}</AdminTopbarContext.Provider>;
}

export function useAdminTopbar() {
  const ctx = useContext(AdminTopbarContext);
  if (!ctx) {
    throw new Error('useAdminTopbar must be used within an AdminTopbarProvider');
  }
  return ctx;
}

