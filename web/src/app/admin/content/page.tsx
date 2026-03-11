'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable, Column, RowAction } from '@/components/admin/data-table';
import { Drawer } from '@/components/admin/drawer';
import { ContentForm } from '@/components/admin/content/content-form';
import { AdminContent } from '@/types/admin';
import adminContentService from '@/services/admin-content';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

export default function ContentPage() {
  const [content, setContent] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<AdminContent | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<AdminContent | null>(null);

  const { toast } = useToast();

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminContentService.getContent({
        page,
        limit: pageSize,
        search: searchQuery || undefined,
      });
      if (response.data) {
        setContent(response.data.content);
        setTotal(response.data.total);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, toast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleCreateContent = async (data: Partial<AdminContent>) => {
    setIsSubmitting(true);
    try {
      await adminContentService.createContent({
        title: data.title!,
        type: data.type || 'movie',
        overview: data.overview!,
        releaseDate: data.releaseDate!,
        genres: data.genres || [],
        rating: data.rating || 0,
      });
      toast({
        title: 'Success',
        description: 'Content created successfully',
      });
      setIsDrawerOpen(false);
      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create content',
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
      await adminContentService.updateContent(selectedContent.id, {
        title: data.title,
        overview: data.overview,
        genres: data.genres,
        releaseDate: data.releaseDate,
      });
      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });
      setIsDrawerOpen(false);
      setSelectedContent(undefined);
      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update content',
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
      await adminContentService.deleteContent(contentToDelete.id);
      toast({
        title: 'Success',
        description: 'Content deleted successfully',
      });
      setDeleteDialogOpen(false);
      setContentToDelete(null);
      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete content',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishContent = async (item: AdminContent) => {
    setIsSubmitting(true);
    try {
      await adminContentService.publishContent(item.id, {
        status: item.status === 'published' ? 'unpublished' : 'published',
      });
      toast({
        title: 'Success',
        description: `Content ${item.status === 'published' ? 'unpublished' : 'published'} successfully`,
      });
      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update content status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    if (!confirm(`Delete ${ids.length} content items?`)) return;
    setIsSubmitting(true);
    try {
      await adminContentService.bulkDeleteContent({
        ids: ids as string[],
      });
      toast({
        title: 'Success',
        description: `${ids.length} content items deleted successfully`,
      });
      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete content',
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
      render: (value) => <span className="text-xs font-mono text-gray-500">{value}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value) => <span className="font-medium text-white">{value}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <Badge variant="secondary" className="bg-white/10 text-gray-300 hover:bg-white/20">
          {value.toUpperCase()}
        </Badge>
      ),
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
      render: (value: string) => <span className="text-gray-400">{new Date(value).toLocaleDateString()}</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (value: number) => <span className="text-yellow-500 font-medium">⭐ {value.toFixed(1)}/10</span>,
    },
    {
      key: 'views',
      label: 'Views',
      render: (value: number) => <span className="text-gray-400">{value.toLocaleString()}</span>,
    },
    {
      key: 'genres',
      label: 'Genres',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((g) => (
            <Badge key={g} variant="outline" className="text-xs bg-white/5 border-white/10 text-gray-400">
              {g}
            </Badge>
          ))}
          {value.length > 2 && <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-gray-400">+{value.length - 2}</Badge>}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <p className="text-gray-400 mt-1">Manage movies and TV shows</p>
        </div>
        <Button
          onClick={() => {
            setSelectedContent(undefined);
            setIsDrawerOpen(true);
          }}
          className="bg-[#E50914] hover:bg-[#C42B1C] shadow-lg shadow-[#E50914]/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Content
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

      {/* Drawer for create/edit */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title={selectedContent ? 'Edit Content' : 'Add New Content'}
        description={selectedContent ? 'Update content information' : 'Add a new movie or TV show'}
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
        />
      </Drawer>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a1a1a] border border-white/10 text-white">
          <AlertDialogTitle className="text-xl font-semibold">Delete Content</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to delete <span className="text-white font-medium">"{contentToDelete?.title}"</span>? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContent}
              className="bg-[#E50914] hover:bg-[#C42B1C] shadow-lg shadow-[#E50914]/20"
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
