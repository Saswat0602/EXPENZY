export interface Category {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    type: 'expense' | 'income';
    userId: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryDto {
    name: string;
    icon?: string;
    color?: string;
    type: 'expense' | 'income';
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
