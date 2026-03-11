'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface RowAction<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  title?: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  rowActions?: RowAction<T>[];
  onBulkDelete?: (ids: (string | number)[]) => void;
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  title,
  onSearch,
  searchPlaceholder = 'Search...',
  searchValue = '',
  rowActions,
  onBulkDelete,
  isLoading = false,
  pagination,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleRowSelection = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((item) => item[keyField] as string | number)));
    }
  };

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  return (
    <div className="space-y-4">
      {/* Header with search and bulk actions */}
      <div className="flex items-center justify-between gap-4">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {onSearch && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full max-w-xs"
          />
        )}
        {selectedRows.size > 0 && onBulkDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onBulkDelete(Array.from(selectedRows))}
          >
            Delete {selectedRows.size}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {rowActions && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === data.length && data.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={`text-xs font-semibold uppercase text-gray-600 ${column.width || ''}`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      {column.label}
                      {sortKey === column.key && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {rowActions && <TableHead className="w-12">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (rowActions ? 2 : 0)} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (rowActions ? 2 : 0)} className="text-center py-8 text-gray-500">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={String(item[keyField])} className="border-b hover:bg-gray-50">
                  {rowActions && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(item[keyField] as string | number)}
                        onCheckedChange={() => toggleRowSelection(item[keyField] as string | number)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={`text-sm ${column.width || ''}`}>
                      {column.render ? column.render(item[column.key], item) : String(item[column.key])}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions.map((action, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => action.onClick(item)}
                              className={action.variant === 'destructive' ? 'text-red-600' : ''}
                            >
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {pagination.page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
