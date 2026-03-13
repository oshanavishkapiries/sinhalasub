'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = useMemo(() => params.get('email') || '', [params]);

  const [email, setEmail] = useState(initialEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { requestPasswordReset, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsRequesting(true);
    try {
      await requestPasswordReset(email);
      toast({
        title: 'Verification code sent',
        description: 'If the account exists, we sent a code to your email.',
      });
    } catch (error) {
      toast({
        title: 'Request failed',
        description: error instanceof Error ? error.message : 'Could not send reset code',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsResetting(true);
    try {
      await resetPassword(email, newPassword, verificationCode);
      toast({
        title: 'Password updated',
        description: 'You can now login with your new password.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Reset failed',
        description: error instanceof Error ? error.message : 'Invalid code or password update failed',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-8" />
        </Link>
      </div>

      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Reset password</CardTitle>
          <CardDescription>
            Request a verification code, then set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleRequestCode} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="outline" className="w-full" disabled={isRequesting}>
              {isRequesting ? 'Sending code...' : 'Send reset code'}
            </Button>
          </form>

          <form onSubmit={handleResetPassword} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="verification-code">Verification code</Label>
              <Input
                id="verification-code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isResetting}>
              {isResetting ? 'Updating password...' : 'Update password'}
            </Button>
          </form>

          <div className="text-center text-sm">
            Back to{' '}
            <Link href="/login" className="underline">
              login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
