'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { AdminUser } from '@/types/admin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type UserFormData = {
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  role?: 'platform-user' | 'moderator';
};

interface UserFormProps {
  mode: 'create' | 'edit';
  user?: AdminUser;
  onSubmit: (data: UserFormData) => void;
  isSubmitting?: boolean;
}

const ROLE_OPTIONS: Array<{ value: 'platform-user' | 'moderator'; label: string }> = [
  { value: 'platform-user', label: 'Platform User' },
  { value: 'moderator', label: 'Moderator' },
];

export function UserForm({ mode, user, onSubmit }: UserFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<UserFormData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
      role: user?.role === 'moderator' ? 'moderator' : 'platform-user',
      password: '',
    },
  });

  const role = watch('role') || 'platform-user';
  const canEditRole = !user || user.role === 'platform-user' || user.role === 'moderator';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="username" className="text-muted-foreground">
          Username
        </Label>
        <Input
          id="username"
          placeholder="username"
          {...register('username', { required: 'Username is required' })}
          className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          {...register('email', { required: 'Email is required' })}
          className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 mt-1.5"
        />
      </div>

      {mode === 'create' && (
        <div>
          <Label htmlFor="password" className="text-muted-foreground">
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="Set a temporary password"
            {...register('password', { required: 'Password is required' })}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 mt-1.5"
          />
        </div>
      )}

      <div>
        <Label htmlFor="avatar" className="text-muted-foreground">
          Avatar URL (optional)
        </Label>
        <Input
          id="avatar"
          placeholder="https://..."
          {...register('avatar')}
          className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="role" className="text-muted-foreground">
          Role
        </Label>
        <Select
          value={role}
          onValueChange={(value) => setValue('role', value as any)}
          disabled={!canEditRole}
        >
          <SelectTrigger
            id="role"
            className="bg-card border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1.5"
          >
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="hover:bg-white/10 focus:bg-white/10"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!canEditRole && (
          <p className="mt-1 text-xs text-muted-foreground">
            This user role cannot be changed from the admin panel.
          </p>
        )}
      </div>
    </form>
  );
}

export default UserForm;
