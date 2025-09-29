
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';
import { WatchProvidersDialog } from '@/components/watch-providers-dialog';

export function ContentInteraction({ title }: { title: string }) {
  const [isProvidersDialogOpen, setIsProvidersDialogOpen] = useState(false);

  return (
    <>
      <div className="mt-8 flex gap-4">
        <Button size="lg" onClick={() => setIsProvidersDialogOpen(true)}>
          <Play className="mr-2 h-5 w-5 fill-current" />
          Play
        </Button>
        <Button size="lg" variant="secondary">
          <Plus className="mr-2 h-5 w-5" />
          Add to My List
        </Button>
      </div>
      <WatchProvidersDialog
        isOpen={isProvidersDialogOpen}
        onOpenChange={setIsProvidersDialogOpen}
        title={title}
      />
    </>
  );
}
