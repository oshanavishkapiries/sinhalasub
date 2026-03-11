'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  submitVariant?: 'default' | 'destructive';
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  submitVariant = 'default',
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between mb-6">
          <div className="flex-1">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <div className="space-y-6">{children}</div>

        {onSubmit && (
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </SheetClose>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              variant={submitVariant}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
