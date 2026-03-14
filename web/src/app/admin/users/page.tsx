'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable, Column, RowAction } from '@/components/admin/data-table';
import { Modal } from '@/components/admin/modal';
import { UserForm, UserFormData } from '@/components/admin/users/user-form';
import { AdminUser } from '@/types/admin';
import {
  useAdminUsersQuery,
  useBulkDeleteAdminUsersMutation,
  useChangeAdminUserRoleMutation,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useUpdateAdminUserMutation,
} from '@/services/hooks/useAdminUsers';
import { useToast } from '@/hooks/use-toast';
import { Edit, ToggleLeft, Trash2 } from 'lucide-react';
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
import { formatDistanceToNowStrict } from 'date-fns';

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSearch, clearSearch } = useAdminTopbar();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [isVerifiedFilter, setIsVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const { toast } = useToast();
  const createFromLayout = searchParams.get('create') === '1';

  const usersQuery = useAdminUsersQuery({
    page,
    perPage: pageSize,
    search: searchQuery || undefined,
    role: roleFilter,
    isActive: isActiveFilter,
    isVerified: isVerifiedFilter,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const createUserMutation = useCreateAdminUserMutation();
  const updateUserMutation = useUpdateAdminUserMutation();
  const deleteUserMutation = useDeleteAdminUserMutation();
  const changeUserRoleMutation = useChangeAdminUserRoleMutation();
  const bulkDeleteUsersMutation = useBulkDeleteAdminUsersMutation();

  const users = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.meta.totalItems ?? 0;
  const loading = usersQuery.isLoading || usersQuery.isFetching;

  useEffect(() => {
    setSearch({
      value: searchQuery,
      placeholder: 'Search by username or email...',
      onChange: (query) => {
        setSearchQuery(query);
        setPage(1);
      },
    });

    return () => clearSearch();
  }, [clearSearch, searchQuery, setSearch]);

  useEffect(() => {
    if (!createFromLayout) return;
    setSelectedUser(undefined);
    setIsDrawerOpen(true);
  }, [createFromLayout]);

  useEffect(() => {
    if (!usersQuery.error) return;
    toast({
      title: 'Error',
      description: usersQuery.error.message || 'Failed to fetch users',
      variant: 'destructive',
    });
  }, [toast, usersQuery.error]);

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open && createFromLayout) {
      router.replace('/admin/users');
    }
  };

  const handleCreateUser = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      await createUserMutation.mutateAsync({
        username: data.username,
        email: data.email,
        password: data.password || '',
        role: data.role,
      });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await updateUserMutation.mutateAsync({
        userId: selectedUser.id,
        data: {
          username: data.username,
          email: data.email,
          avatar: data.avatar,
          role: data.role,
        },
      });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setIsDrawerOpen(false);
      setSelectedUser(undefined);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteUserMutation.mutateAsync({ userId: userToDelete.id });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    if (!confirm(`Delete ${ids.length} users?`)) return;
    setIsSubmitting(true);
    try {
      const result = await bulkDeleteUsersMutation.mutateAsync({ ids: ids as string[] });
      toast({
        title: 'Success',
        description:
          result.failedCount === 0
            ? `${result.deletedCount} users deleted successfully`
            : `${result.deletedCount} deleted, ${result.failedCount} failed`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete users',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<AdminUser>[] = [
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
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (value: string) => <span className="font-medium text-foreground">{value}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value: string) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      filter: {
        type: 'select',
        value: roleFilter,
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Moderator', value: 'moderator' },
          { label: 'Platform User', value: 'platform-user' },
        ],
        onChange: (value) => {
          setRoleFilter(value);
          setPage(1);
        },
      },
      render: (value: string) => (
        <Badge 
          variant={value === 'admin' ? 'default' : 'secondary'}
          className={
            value === 'admin' 
              ? 'bg-primary hover:bg-accent' 
              : 'bg-white/10 text-muted-foreground hover:bg-white/20'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'isVerified',
      label: 'Verified',
      filter: {
        type: 'boolean',
        value: isVerifiedFilter,
        onChange: (value) => {
          setIsVerifiedFilter(value);
          setPage(1);
        },
        labels: { true: 'Verified', false: 'Unverified' },
      },
      render: (value: boolean) => (
        <Badge
          variant={value ? 'default' : 'secondary'}
          className={value ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
        >
          {value ? 'yes' : 'no'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Active',
      filter: {
        type: 'boolean',
        value: isActiveFilter,
        onChange: (value) => {
          setIsActiveFilter(value);
          setPage(1);
        },
        labels: { true: 'Active', false: 'Inactive' },
      },
      render: (value: boolean) => (
        <Badge
          variant={value ? 'default' : 'secondary'}
          className={value ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
        >
          {value ? 'yes' : 'no'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => <span className="text-muted-foreground">{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>,
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      render: (value?: string) => (
        <span className="text-muted-foreground">
          {value ? formatDistanceToNowStrict(new Date(value), { addSuffix: true }) : 'N/A'}
        </span>
      ),
    },
  ];

  const rowActions: RowAction<AdminUser>[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (user) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
      },
    },
    {
      label: 'Toggle Role',
      icon: <ToggleLeft className="h-4 w-4" />,
      onClick: async (user) => {
        if (user.role !== 'platform-user' && user.role !== 'moderator') return;
        setIsSubmitting(true);
        try {
          const nextRole = user.role === 'platform-user' ? 'moderator' : 'platform-user';
          await changeUserRoleMutation.mutateAsync({ userId: user.id, role: nextRole });
          toast({ title: 'Success', description: `Role updated to ${nextRole}` });
        } catch (error) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update role',
            variant: 'destructive',
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      onClick: (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and their permissions</p>
        </div>
      </div>

      <DataTable<AdminUser>
        data={users}
        columns={columns}
        keyField="id"
        rowActions={rowActions}
        showSearch={false}
        searchValue={searchQuery}
        searchPlaceholder="Search by username or email..."
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
        title={selectedUser ? 'Edit User' : 'Create New User'}
        description={selectedUser ? 'Update user information' : 'Add a new user to the system'}
        onSubmit={() => {
          const form = document.querySelector('form');
          form?.dispatchEvent(new Event('submit', { bubbles: true }));
        }}
        isSubmitting={isSubmitting}
        submitLabel={selectedUser ? 'Update' : 'Create'}
      >
        <UserForm
          mode={selectedUser ? 'edit' : 'create'}
          user={selectedUser}
          onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogTitle className="text-xl font-semibold">Delete User</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete <span className="text-foreground font-medium">{userToDelete?.username}</span>? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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
