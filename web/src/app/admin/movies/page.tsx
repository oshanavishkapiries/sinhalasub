'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable, Column, RowAction } from '@/components/admin/data-table';
import { Modal } from '@/components/admin/modal';
import { ContentForm } from '@/components/admin/content/content-form';
import { AdminContent } from '@/types/admin';
import {
  useAdminContentQuery,
  useBulkDeleteAdminContentMutation,
  useCreateAdminContentMutation,
  useDeleteAdminContentMutation,
  usePublishAdminContentMutation,
  useUpdateAdminContentMutation,
} from '@/services/hooks/useAdminContent';
import { useToast } from '@/hooks/use-toast';
import { Edit, Eye, EyeOff, Trash2, Film } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAdminTopbar } from '@/contexts/admin-topbar-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function MoviesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSearch, clearSearch } = useAdminTopbar();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'movie' | 'tv' | undefined>('movie');
  const [statusFilter, setStatusFilter] = useState<'published' | 'unpublished' | undefined>(undefined);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<AdminContent | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<AdminContent | null>(null);

  const { toast } = useToast();
  const createFromLayout = searchParams.get('create') === '1';

  const contentQuery = useAdminContentQuery({
    page,
    limit: pageSize,
    search: searchQuery || undefined,
    type: typeFilter,
    status: statusFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const createContentMutation = useCreateAdminContentMutation();
  const updateContentMutation = useUpdateAdminContentMutation();
  const deleteContentMutation = useDeleteAdminContentMutation();
  const publishContentMutation = usePublishAdminContentMutation();
  const bulkDeleteContentMutation = useBulkDeleteAdminContentMutation();

  const content = contentQuery.data?.data?.content ?? [];
  const total = contentQuery.data?.data?.total ?? 0;
  const loading = contentQuery.isLoading || contentQuery.isFetching;

  useEffect(() => {
    setSearch({
      value: searchQuery,
      placeholder: 'Search by title...',
      onChange: (query) => {
        setSearchQuery(query);
        setPage(1);
      },
    });

    return () => clearSearch();
  }, [clearSearch, searchQuery, setSearch]);

  useEffect(() => {
    if (!createFromLayout) return;
    setSelectedContent(undefined);
    setIsDrawerOpen(true);
  }, [createFromLayout]);

  useEffect(() => {
    if (!contentQuery.error) return;
    toast({
      title: 'Error',
      description: contentQuery.error.message || 'Failed to fetch content',
      variant: 'destructive',
    });
  }, [toast, contentQuery.error]);

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open && createFromLayout) {
      router.replace('/admin/movies');
    }
  };

  const handleCreateContent = async (data: Partial<AdminContent>) => {
    if (!data.title || !data.overview || !data.releaseDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await createContentMutation.mutateAsync({
        title: data.title,
        type: 'movie',
        overview: data.overview,
        releaseDate: data.releaseDate,
        genres: data.genres || [],
        rating: data.rating || 0,
      });
      toast({
        title: 'Success',
        description: 'Movie created successfully',
      });
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create movie',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateContent = async (data: Partial<AdminContent>) => {
    if (!selectedContent) return;
    setIsSubmitting(true);
    try {
      await updateContentMutation.mutateAsync({
        contentId: selectedContent.id,
        data,
      });
      toast({
        title: 'Success',
        description: 'Movie updated successfully',
      });
      setIsDrawerOpen(false);
      setSelectedContent(undefined);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update movie',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!contentToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteContentMutation.mutateAsync({ contentId: contentToDelete.id });
      toast({
        title: 'Success',
        description: 'Movie deleted successfully',
      });
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete movie',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: AdminContent) => {
    const newStatus = item.status === 'published' ? 'unpublished' : 'published';
    setIsSubmitting(true);
    try {
      await publishContentMutation.mutateAsync({
        contentId: item.id,
        data: { status: newStatus },
      });
      toast({
        title: 'Success',
        description: `Movie ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    if (!confirm(`Delete ${ids.length} items?`)) return;
    setIsSubmitting(true);
    try {
      const result = await bulkDeleteContentMutation.mutateAsync({ ids: ids as string[] });
      toast({
        title: 'Success',
        description: result.data
          ? `${result.data.deletedCount} items deleted successfully`
          : 'Items deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete items',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<AdminContent>[] = [
    {
      key: 'id',
      label: 'ID',
      width: 'w-20',
      render: (value: string) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs font-mono text-muted-foreground cursor-help">
                {String(value).slice(0, 8)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{String(value)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value: string) => <span className="font-medium text-foreground">{value}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      filter: {
        type: 'select',
        value: typeFilter,
        options: [
          { label: 'All', value: '' },
          { label: 'Movies', value: 'movie' },
          { label: 'TV Shows', value: 'tv' },
        ],
        onChange: (value) => {
          setTypeFilter((value as 'movie' | 'tv') || undefined);
          setPage(1);
        },
      },
      render: (value: string) => (
        <Badge className="bg-white/10 text-muted-foreground hover:bg-white/20">
          <Film className="w-3 h-3 mr-1" />
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      filter: {
        type: 'select',
        value: statusFilter,
        options: [
          { label: 'All', value: '' },
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'unpublished' },
        ],
        onChange: (value) => {
          setStatusFilter((value as 'published' | 'unpublished') || undefined);
          setPage(1);
        },
      },
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
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value: number) => <span className="text-foreground">{value.toFixed(1)}</span>,
    },
    {
      key: 'releaseDate',
      label: 'Release Date',
      sortable: true,
      render: (value?: string) => <span className="text-muted-foreground">{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>,
    },
  ];

  const rowActions: RowAction<AdminContent>[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => {
        setSelectedContent(item);
        setIsDrawerOpen(true);
      },
    },
    {
      label: 'Toggle Publish',
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => handleTogglePublish(item),
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
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Movies Management</h1>
          <p className="text-muted-foreground mt-1">Manage movies and TV shows</p>
        </div>
      </div>

      <DataTable<AdminContent>
        data={content}
        columns={columns}
        keyField="id"
        rowActions={rowActions}
        showSearch={false}
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

      {/* Modal for create/edit */}
      <Modal
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        title={selectedContent ? 'Edit Movie' : 'Create New Movie'}
        description={selectedContent ? 'Update movie information' : 'Add a new movie to the system'}
        onSubmit={() => {
          const form = document.querySelector('form');
          form?.dispatchEvent(new Event('submit', { bubbles: true }));
        }}
        isSubmitting={isSubmitting}
        submitLabel={selectedContent ? 'Update' : 'Create'}
      >
        <ContentForm
          content={selectedContent}
          onSubmit={selectedContent ? handleUpdateContent : handleCreateContent}
          isSubmitting={isSubmitting}
          defaultType="movie"
        />
      </Modal>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogTitle className="text-xl font-semibold">Delete Movie</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete <span className="text-foreground font-medium">{contentToDelete?.title}</span>? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContent}
              className="bg-primary hover:bg-accent shadow-lg shadow-primary/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
