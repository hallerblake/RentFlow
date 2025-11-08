'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PropertyImages } from './PropertyImages';

type PropertyImagesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: string;
    name: string;
  } | null;
};

export function PropertyImagesDialog({ open, onOpenChange, property }: PropertyImagesDialogProps) {
  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Images for {property.name}</DialogTitle>
        </DialogHeader>

        <PropertyImages propertyId={property.id} />
      </DialogContent>
    </Dialog>
  );
}
