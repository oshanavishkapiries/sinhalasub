

'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Content, TVSeason } from '@/types';
import { getImageUrl, POSTER_SIZE } from '@/lib/tmdb';
import { Star, Download, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ContentInteraction } from './content-interaction';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ContentCarousel } from './content-carousel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TVSeasons } from './tv-seasons';

// Placeholder data for download links
const downloadLinks = [
  {
    provider: 'Fast-DL',
    links: [
      { quality: '1080p', size: '2.5 GB', url: '#' },
      { quality: '720p', size: '1.2 GB', url: '#' },
      { quality: '480p', size: '700 MB', url: '#' },
    ],
  },
  {
    provider: 'Mega.nz',
    links: [
      { quality: '1080p', size: '2.5 GB', url: '#' },
      { quality: '720p', size: '1.2 GB', url: '#' },
    ],
  },
    {
    provider: 'Torrent',
    links: [
      { quality: '4K', size: '8.5 GB', url: '#' },
      { quality: '1080p', size: '2.5 GB', url: '#' },
      { quality: '720p', size: '1.2 GB', url: '#' },
    ],
  },
];

// Placeholder for comments
const comments = [
    {
        id: 1,
        author: 'MovieFan123',
        avatar: 'https://picsum.photos/seed/user2/40/40',
        timestamp: '2 hours ago',
        content: 'This movie was absolutely amazing! The visuals were stunning and the acting was top-notch.',
        isAdmin: false,
    },
    {
        id: 2,
        author: 'Admin',
        avatar: 'https://picsum.photos/seed/admin/40/40',
        timestamp: '1 hour ago',
        content: 'Glad you enjoyed it! We agree, it\'s a masterpiece.',
        isAdmin: true,
    },
    {
        id: 3,
        author: 'CinephileX',
        avatar: 'https://picsum.photos/seed/user3/40/40',
        timestamp: '30 minutes ago',
        content: 'I thought the pacing was a bit slow in the second act, but the ending was a huge payoff. Highly recommended!',
        isAdmin: false,
    }
]

export function ContentDetails({ item, similarContent }: { item: Content, similarContent: Content[] }) {
  const title = item.title || item.name;
  const releaseYear = item.release_date ? new Date(item.release_date).getFullYear() : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A');
  const genres = (item as any).genres?.map((g: any) => g.name) || [];
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const seasons = (item as any).seasons as TVSeason[];

  return (
    <>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="hidden md:block">
            <Image
                src={getImageUrl(item.poster_path, POSTER_SIZE)}
                alt={`Poster for ${title}`}
                width={500}
                height={750}
                className="rounded-lg shadow-2xl"
            />
            </div>
            <div className="md:col-span-2">
            <h1 className="font-headline text-4xl font-black md:text-6xl">{title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground">
                <span>{releaseYear}</span>
                <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span>{item.vote_average.toFixed(1)}</span>
                </div>
                <Badge variant="outline" className="capitalize">{item.media_type}</Badge>
            </div>
            <p className="mt-6 text-lg text-foreground/80">{item.overview}</p>
            <div className="mt-4 flex flex-wrap gap-2">
                {genres.map((genre: string) => (
                <Badge key={genre} variant="secondary">{genre}</Badge>
                ))}
            </div>
            {item.media_type === 'movie' && <ContentInteraction title={title || ''} />}
            </div>
        </div>

        <div className="mt-12">
            <Card>
                <CardHeader>
                    <CardTitle>From the Studio</CardTitle>
                    <CardDescription>A special thank you to our subtitle creators and some enthusiast content for you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-invert max-w-full">
                        <p>This film was a labor of love, spending nearly a decade in development hell before finally getting the green light. The director, a lifelong fan of the source material, fought tooth and nail to maintain the integrity of the original story, a battle that is palpable in every frame.</p>
                        <p>We'd also like to extend a heartfelt thank you to the dedicated subtitling team who worked tirelessly to bring this masterpiece to a global audience. Your passion and precision do not go unnoticed.</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {item.media_type === 'tv' && seasons && (
          <div className="mt-12">
            <h2 className="mb-4 font-headline text-3xl font-bold">Seasons</h2>
            <TVSeasons seasons={seasons} tvShowId={item.id} />
          </div>
        )}

        {item.media_type === 'movie' && (
            <div className="mt-12">
                <h2 className="mb-4 font-headline text-3xl font-bold">Downloads</h2>
                <Accordion type="single" collapsible className="w-full">
                {downloadLinks.map((provider) => (
                    <AccordionItem value={provider.provider} key={provider.provider}>
                    <AccordionTrigger className="text-xl font-semibold">{provider.provider}</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-2 pt-2">
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
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            </div>
        )}
        
        <div className="mt-12">
             <ContentCarousel title="Similar Movies & TV Shows" items={similarContent} />
        </div>

        <div className="mt-12">
            <h2 className="mb-4 font-headline text-3xl font-bold">Comments ({comments.length})</h2>
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src={userAvatar?.imageUrl} alt="Your avatar" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <form>
                            <Textarea placeholder="Write a comment..." className="mb-2" />
                            <div className="flex justify-end">
                                <Button type="submit">
                                    <Send className="mr-2 h-4 w-4" />
                                    Post Comment
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-8">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src={comment.avatar} alt={`${comment.author}'s avatar`} />
                                <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{comment.author}</p>
                                        {comment.isAdmin && <Badge variant="primary" className="text-xs">Admin</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                                </div>
                                <p className="mt-1 text-foreground/80">{comment.content}</p>
                                {!comment.isAdmin && 
                                    <Button variant="ghost" size="sm" className="mt-1 -ml-3">Reply</Button>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
  );
}
