'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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

export default function MoviesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSearch, clearSearch } = useAdminTopbar();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
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
    type: 'movie',
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

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open && createFromLayout) {
      router.replace('/admin/movies');
    }
  };

  useEffect(() => {
    if (!contentQuery.error) return;
    toast({
      title: 'Error',
      description: contentQuery.error.message || 'Failed to fetch movies',
      variant: 'destructive',
    });
  }, [contentQuery.error, toast]);

  const handleCreateContent = async (data: Partial<AdminContent>) => {
    setIsSubmitting(true);
    try {
      await createContentMutation.mutateAsync({
        title: data.title!,
        type: 'movie',
        overview: data.overview!,
        releaseDate: data.releaseDate!,
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
        description: error.message || 'Failed to create movie',
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
        data: {
          title: data.title,
          overview: data.overview,
          genres: data.genres,
          releaseDate: data.releaseDate,
        },
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
        description: error.message || 'Failed to update movie',
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
        description: error.message || 'Failed to delete movie',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishContent = async (item: AdminContent) => {
    setIsSubmitting(true);
    try {
      await publishContentMutation.mutateAsync({
        contentId: item.id,
        data: { status: item.status === 'published' ? 'unpublished' : 'published' },
      });
      toast({
        title: 'Success',
        description: `Movie ${item.status === 'published' ? 'unpublished' : 'published'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update movie status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    if (!confirm(`Delete ${ids.length} movies?`)) return;
    setIsSubmitting(true);
    try {
      await bulkDeleteContentMutation.mutateAsync({ ids: ids as string[] });
      toast({
        title: 'Success',
        description: `${ids.length} movies deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete movies',
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
      label: selectedContent?.status === 'published' ? 'Unpublish' : 'Publish',
      icon: selectedContent?.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
      onClick: handlePublishContent,
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => {
        setSelectedContent(item);
        setIsDrawerOpen(true);
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
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Movies Management</h1>
          <p className="text-muted-foreground mt-1">Manage movies</p>
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
        title={selectedContent ? 'Edit Movie' : 'Add New Movie'}
        description={selectedContent ? 'Update movie information' : 'Add a new movie'}
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
            Are you sure you want to delete <span className="text-foreground font-medium">"{contentToDelete?.title}"</span>? This action cannot be undone.
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
