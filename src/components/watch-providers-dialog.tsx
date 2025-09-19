
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';

interface WatchProvidersDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
}

const providers = [
    { name: 'Stream-Hub', url: '/player/stream-hub', hasAds: true },
    { name: 'Play-Now', url: '/player/play-now', hasAds: false },
    { name: 'Vidoza', url: '/player/vidoza', hasAds: true },
    { name: 'Dood-Stream', url: '/player/dood-stream', hasAds: true },
]

export function WatchProvidersDialog({ isOpen, onOpenChange, title }: WatchProvidersDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Watch &quot;{title}&quot;</DialogTitle>
           <DialogDescription>
            Select a provider to start watching.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-2 pt-4">
            {providers.map(provider => (
                <Link key={provider.name} href={provider.url} passHref>
                    <Button variant="secondary" className="w-full justify-start gap-3 h-auto py-3">
                        <PlayCircle className="h-5 w-5 text-primary" />
                        <div className="flex-1 flex justify-between items-center">
                            <span className="font-semibold">{provider.name}</span>
                            <Badge variant={provider.hasAds ? 'destructive' : 'default'} className="bg-opacity-20 text-opacity-90 border-opacity-30">
                                {provider.hasAds ? 'Contains Ads' : 'Ad-Free'}
                            </Badge>
                        </div>
                    </Button>
                </Link>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
