'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
      // Redirect based on user role
      router.push('/');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setEmail('admin@sinhalasub.lk');
    setPassword('test@123');
  };

  const handleDemoUser = async () => {
    setEmail('user@sinhalasub.lk');
    setPassword('test@123');
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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Login with Google (Coming Soon)
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 border-t pt-4">
            <p className="text-xs text-gray-500 mb-3 font-semibold">DEMO CREDENTIALS:</p>
            <div className="space-y-2">
              <button
                onClick={handleDemoAdmin}
                className="w-full text-left px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm"
              >
                <p className="font-semibold text-red-500">Admin</p>
                <p className="text-xs text-gray-300">admin@sinhalasub.lk / test@123</p>
              </button>
              <button
                onClick={handleDemoUser}
                className="w-full text-left px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm"
              >
                <p className="font-semibold text-blue-500">User</p>
                <p className="text-xs text-gray-300">user@sinhalasub.lk / test@123</p>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            Didn&apos;t verify your account?{' '}
            <Link href="/verify" className="underline">
              Verify now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

