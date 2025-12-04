'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ActionMenuItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
}

interface MobileActionMenuProps {
    actions: ActionMenuItem[];
    className?: string;
}

export function MobileActionMenu({ actions, className = '' }: MobileActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleActionClick = (action: ActionMenuItem) => {
        action.onClick();
        setIsOpen(false);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`p-1.5 hover:bg-muted rounded-md transition-colors md:hidden ${className}`}
                aria-label="More options"
            >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Desktop Buttons (visible on md and up) */}
            <div className="hidden md:flex items-center gap-1">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className={`p-1.5 hover:bg-muted rounded-md transition-colors ${action.variant === 'destructive' ? 'hover:bg-destructive/10' : ''
                            }`}
                        aria-label={action.label}
                    >
                        <span className={action.variant === 'destructive' ? 'text-muted-foreground hover:text-destructive' : 'text-muted-foreground'}>
                            {action.icon}
                        </span>
                    </button>
                ))}
            </div>

            {/* Mobile Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-lg animate-in slide-in-from-bottom duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-semibold text-lg">Actions</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-muted rounded-md transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="p-2">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleActionClick(action)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors ${action.variant === 'destructive' ? 'text-destructive' : ''
                                        }`}
                                >
                                    {action.icon}
                                    <span className="font-medium">{action.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Safe Area Padding for iOS */}
                        <div className="h-safe-area-inset-bottom" />
                    </div>
                </div>
            )}
        </>
    );
}

// Preset action creators for common use cases
export const createEditAction = (onEdit: () => void): ActionMenuItem => ({
    label: 'Edit',
    icon: <Edit2 className="w-5 h-5" />,
    onClick: onEdit,
    variant: 'default',
});

export const createDeleteAction = (onDelete: () => void): ActionMenuItem => ({
    label: 'Delete',
    icon: <Trash2 className="w-5 h-5" />,
    onClick: onDelete,
    variant: 'destructive',
});
