'use client';

import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    return (
        <>
            {/* Mobile Dropdown (visible on mobile) */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={`p-1.5 hover:bg-muted rounded-md transition-colors md:hidden ${className}`}
                        aria-label="More options"
                    >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {actions.map((action, index) => (
                        <DropdownMenuItem
                            key={index}
                            onClick={action.onClick}
                            className={`flex items-center gap-3 cursor-pointer ${action.variant === 'destructive'
                                    ? 'text-destructive focus:text-destructive focus:bg-destructive/10'
                                    : ''
                                }`}
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

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
                        <span
                            className={
                                action.variant === 'destructive'
                                    ? 'text-muted-foreground hover:text-destructive'
                                    : 'text-muted-foreground'
                            }
                        >
                            {action.icon}
                        </span>
                    </button>
                ))}
            </div>
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
