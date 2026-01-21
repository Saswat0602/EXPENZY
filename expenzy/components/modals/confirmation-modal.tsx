'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description?: string;
    children?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    isLoading?: boolean;
}

export function ConfirmationModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'destructive',
    isLoading = false,
}: ConfirmationModalProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {variant === 'destructive' && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                        )}
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    {description && (
                        <DialogDescription className="pt-2">{description}</DialogDescription>
                    )}
                </DialogHeader>
                {children && <div className="py-4">{children}</div>}
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
