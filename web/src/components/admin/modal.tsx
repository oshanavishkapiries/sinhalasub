'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ModalProps {
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

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  submitVariant = 'default',
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">{title}</DialogTitle>
          {description && <DialogDescription className="text-muted-foreground">{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6">{children}</div>

        {onSubmit && (
          <DialogFooter className="gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-border text-foreground hover:bg-white/10 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              variant={submitVariant}
              className={`w-full sm:w-auto ${
                submitVariant === 'default' 
                  ? 'bg-primary hover:bg-accent shadow-lg shadow-primary/20' 
                  : ''
              }`}
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
