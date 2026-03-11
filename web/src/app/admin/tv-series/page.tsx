'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable, Column, RowAction } from '@/components/admin/data-table';
import { AdminContent } from '@/types/admin';
import adminContentService from '@/services/admin-content';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Eye, EyeOff, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

export default function TvSeriesPage() {
  const router = useRouter();
  const [content, setContent] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<AdminContent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminContentService.getContent({
        page,
        limit: pageSize,
        search: searchQuery || undefined,
        type: 'tv',
      });
      if (response.data) {
        setContent(response.data.content);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch TV series',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, toast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleDeleteContent = async () => {
    if (!contentToDelete) return;
    setIsDeleting(true);
    try {
      await adminContentService.deleteContent(contentToDelete.id);
      toast({
        title: 'Success',
        description: 'TV series deleted successfully',
      });
      setDeleteDialogOpen(false);
      setContentToDelete(null);
      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete TV series',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishContent = async (item: AdminContent) => {
    try {
      await adminContentService.publishContent(item.id, {
        status: item.status === 'published' ? 'unpublished' : 'published',
      });
      toast({
        title: 'Success',
        description: `TV series ${item.status === 'published' ? 'unpublished' : 'published'} successfully`,
      });
      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update TV series status',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    if (!confirm(`Delete ${ids.length} TV series?`)) return;
    try {
      await adminContentService.bulkDeleteContent({
        ids: ids as string[],
      });
      toast({
        title: 'Success',
        description: `${ids.length} TV series deleted successfully`,
      });
      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete TV series',
        variant: 'destructive',
      });
    }
  };

  const columns: Column<AdminContent>[] = [
    {
      key: 'id',
      label: 'ID',
      width: 'w-20',
      render: (value) => <span className="text-xs font-mono text-muted-foreground">{value}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value) => <span className="font-medium text-foreground">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge 
          variant={value === 'published' ? 'default' : 'secondary'}
          className={value === 'published' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'releaseDate',
      label: 'Release Date',
      render: (value: string) => <span className="text-muted-foreground">{new Date(value).toLocaleDateString()}</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (value: number) => <span className="text-yellow-500 font-medium">⭐ {value.toFixed(1)}/10</span>,
    },
    {
      key: 'views',
      label: 'Views',
      render: (value: number) => <span className="text-muted-foreground">{value.toLocaleString()}</span>,
    },
    {
      key: 'genres',
      label: 'Genres',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((g) => (
              <Badge key={g} variant="outline" className="text-xs bg-white/5 border-border text-muted-foreground">
              {g}
            </Badge>
          ))}
          {value.length > 2 && <Badge variant="outline" className="text-xs bg-white/5 border-border text-muted-foreground">+{value.length - 2}</Badge>}
        </div>
      ),
    },
  ];

  const rowActions: RowAction<AdminContent>[] = [
    {
      label: 'Publish/Unpublish',
      icon: <Eye className="h-4 w-4" />,
      onClick: handlePublishContent,
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => {
        // TODO: Navigate to edit page when created
        router.push(`/admin/tv-series/edit/${item.id}`);
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      onClick: (item) => {
        setContentToDelete(item);
        setDeleteDialogOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">TV Series Management</h1>
          <p className="text-muted-foreground mt-1">Manage TV series</p>
        </div>
        <Button
          onClick={() => router.push('/admin/tv-series/create')}
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create TV Series
        </Button>
      </div>

      <DataTable<AdminContent>
        data={content}
        columns={columns}
        keyField="id"
        rowActions={rowActions}
        onSearch={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
        searchValue={searchQuery}
        searchPlaceholder="Search by title..."
        onBulkDelete={handleBulkDelete}
        isLoading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
        }}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogTitle className="text-xl font-semibold">Delete TV Series</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete <span className="text-foreground font-medium">"{contentToDelete?.title}"</span>? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContent}
              className="bg-accent hover:bg-accent/90 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
