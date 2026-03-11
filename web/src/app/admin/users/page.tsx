'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable, Column, RowAction } from '@/components/admin/data-table';
import { Drawer } from '@/components/admin/drawer';
import { UserForm } from '@/components/admin/users/user-form';
import { AdminUser } from '@/types/admin';
import adminUsersService from '@/services/admin-users';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminUsersService.getUsers({
        page,
        limit: pageSize,
        search: searchQuery || undefined,
      });
      if (response.data) {
        setUsers(response.data.users);
        setTotal(response.data.total);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (data: Partial<AdminUser>) => {
    setIsSubmitting(true);
    try {
      await adminUsersService.createUser({
        email: data.email!,
        name: data.name!,
        role: data.role || UserRole.USER,
        password: 'TempPassword123!', // Default password for new users
      });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      setIsDrawerOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (data: Partial<AdminUser>) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await adminUsersService.updateUser(selectedUser.id, {
        name: data.name,
        email: data.email,
        role: data.role,
      });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setIsDrawerOpen(false);
      setSelectedUser(undefined);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
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
      await adminUsersService.deleteUser(userToDelete.id);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
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
      await adminUsersService.bulkDeleteUsers({
        ids: ids as string[],
      });
      toast({
        title: 'Success',
        description: `${ids.length} users deleted successfully`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete users',
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
      render: (value) => <span className="text-xs font-mono text-gray-500">{value}</span>,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: UserRole) => (
        <Badge variant={value === UserRole.SUPER_ADMIN ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge
          variant={
            value === 'active'
              ? 'default'
              : value === 'inactive'
                ? 'secondary'
                : 'destructive'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      render: (value?: string) => (value ? new Date(value).toLocaleDateString() : 'N/A'),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 mt-1">Manage system users and their permissions</p>
        </div>
        <Button
          onClick={() => {
            setSelectedUser(undefined);
            setIsDrawerOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <DataTable<AdminUser>
        data={users}
        columns={columns}
        keyField="id"
        rowActions={rowActions}
        onSearch={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
        searchValue={searchQuery}
        searchPlaceholder="Search by name or email..."
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
          user={selectedUser}
          onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
          isSubmitting={isSubmitting}
        />
      </Drawer>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
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
