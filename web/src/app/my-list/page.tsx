
import { Header } from '@/components/header';
import { getContent } from '@/lib/data';
import { ContentCard } from '@/components/content-card';
import type { Content } from '@/types';

export default async function MyListPage() {
  const allContent = await getContent();
  // Note: "my-list" is not a category from TMDB, so this will be empty.
  // This would need a user-specific list implementation (e.g., in a database).
  const myList = allContent.filter(c => c.category === 'my-list');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="mb-8 font-headline text-4xl font-bold">My List</h1>
          {myList.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {myList.map(item => (
                <ContentCard key={item.id} item={item as Content} />
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
              <p className="text-muted-foreground">Your list is empty. Add shows and movies to see them here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
