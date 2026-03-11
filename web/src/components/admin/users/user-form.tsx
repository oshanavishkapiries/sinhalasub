'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { AdminUser } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserFormProps {
  user?: AdminUser;
  onSubmit: (data: Partial<AdminUser>) => void;
  isSubmitting?: boolean;
}

const ROLES = [
  { value: UserRole.USER, label: 'User' },
  { value: UserRole.MODERATOR, label: 'Moderator' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.SUPER_ADMIN, label: 'Super Admin' },
];

const STATUSES = ['active', 'inactive', 'banned'];

export function UserForm({ user, onSubmit, isSubmitting = false }: UserFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<Partial<AdminUser>>({
    defaultValues: user || {
      email: '',
      name: '',
      role: UserRole.USER,
      status: 'active',
    },
  });

  const role = watch('role');
  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          {...register('email', { required: 'Email is required' })}
          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20 mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="name" className="text-gray-300">Name</Label>
        <Input
          id="name"
          placeholder="Full name"
          {...register('name', { required: 'Name is required' })}
          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20 mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="role" className="text-gray-300">Role</Label>
        <Select value={role || UserRole.USER} onValueChange={(value) => setValue('role', value as UserRole)}>
          <SelectTrigger id="role" className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#E50914] focus:ring-[#E50914]/20 mt-1.5">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value} className="hover:bg-white/10 focus:bg-white/10">
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status" className="text-gray-300">Status</Label>
        <Select value={status || 'active'} onValueChange={(value) => setValue('status', value as any)}>
          <SelectTrigger id="status" className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#E50914] focus:ring-[#E50914]/20 mt-1.5">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="hover:bg-white/10 focus:bg-white/10">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}
