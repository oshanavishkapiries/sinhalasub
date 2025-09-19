
'use client'

import { useState } from 'react';
import type { Episode } from '@/types';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download, Play } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';
import { WatchProvidersDialog } from './watch-providers-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Link from 'next/link';

interface EpisodeCardProps {
    episode: Episode;
}

const downloadLinks = [
    {
      provider: 'Fast-DL',
      links: [
        { quality: '1080p', size: '1.2 GB', url: '#' },
        { quality: '720p', size: '800 MB', url: '#' },
      ],
    },
    {
      provider: 'Torrent',
      links: [
        { quality: '1080p', size: '1.2 GB', url: '#' },
        { quality: '720p', size: '800 MB', url: '#' },
      ],
    },
  ];

export function EpisodeCard({ episode }: EpisodeCardProps) {
    const [isProvidersDialogOpen, setIsProvidersDialogOpen] = useState(false);
    const [isDownloadsDialogOpen, setIsDownloadsDialogOpen] = useState(false);

    return (
        <>
            <Card className="overflow-hidden">
                <div className="relative aspect-video">
                    <Image
                        src={getImageUrl(episode.still_path, 'w500')}
                        alt={`Still from ${episode.name}`}
                        fill
                        className="object-cover"
                    />
                </div>
                <CardContent className="p-4">
                    <h3 className="font-bold truncate">E{episode.episode_number}: {episode.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{episode.overview}</p>
                    <div className="flex gap-2 mt-4">
                        <Button className="w-full" onClick={() => setIsProvidersDialogOpen(true)}>
                            <Play className="mr-2" /> Play
                        </Button>
                        <Button className="w-full" variant="secondary" onClick={() => setIsDownloadsDialogOpen(true)}>
                            <Download className="mr-2" /> Download
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <WatchProvidersDialog
                isOpen={isProvidersDialogOpen}
                onOpenChange={setIsProvidersDialogOpen}
                title={episode.name}
            />

            <Dialog open={isDownloadsDialogOpen} onOpenChange={setIsDownloadsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Download &quot;{episode.name}&quot;</DialogTitle>
                        <DialogDescription>Select a provider to start downloading.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col space-y-2 pt-4">
                        {downloadLinks.map((provider) => (
                            <div key={provider.provider}>
                                <h4 className="font-semibold mb-2">{provider.provider}</h4>
                                <div className="flex flex-col gap-2">
                                {provider.links.map((link) => (
                                    <a
                                    key={link.quality}
                                    href={link.url}
                                    download
                                    className="flex items-center justify-between rounded-md bg-secondary p-3 transition-colors hover:bg-secondary/80"
                                    >
                                    <div className="flex items-center gap-3">
                                        <Download className="h-5 w-5 text-primary" />
                                        <div>
                                            <span className="font-semibold">{link.quality}</span>
                                            <span className="text-sm text-muted-foreground ml-2">({link.size})</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Download</Button>
                                    </a>
                                ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
