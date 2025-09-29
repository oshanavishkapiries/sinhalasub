import { Logo } from '@/components/logo';

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Logo className="h-auto animate-pulse" />
    </div>
  );
}
