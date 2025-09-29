
'use client';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { searchContent } from '@/lib/tmdb';
import { ContentCard } from '@/components/content-card';
import type { Content } from '@/types';
import { useDebounce } from 'use-debounce';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Content[]>([]);
    const [debouncedQuery] = useDebounce(query, 500);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function performSearch() {
            if (debouncedQuery) {
                setIsLoading(true);
                const searchResults = await searchContent(debouncedQuery);
                setResults(searchResults);
                setIsLoading(false);
            } else {
                setResults([]);
            }
        }
        performSearch();
    }, [debouncedQuery]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          <div className="relative mx-auto max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search for movies or TV shows..." 
              className="w-full pl-10 text-lg h-14" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="mt-12">
             {isLoading ? (
                 <p className="text-center text-muted-foreground">Searching...</p>
             ) : results.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {results.map(item => (
                        <ContentCard key={item.id} item={item} />
                    ))}
                </div>
            ) : query ? (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
                    <p className="text-muted-foreground">No results found for &quot;{query}&quot;.</p>
                </div>
            ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
                    <p className="text-muted-foreground">Start typing to search for content.</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
