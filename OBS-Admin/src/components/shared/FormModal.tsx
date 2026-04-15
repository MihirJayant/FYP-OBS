import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export function FormModal({ open, onOpenChange, title, children }: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
