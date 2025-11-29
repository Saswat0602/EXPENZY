export interface Tag {
    id: string;
    userId: string;
    name: string;
    color?: string;
    icon?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTagDto {
    name: string;
    color?: string;
    icon?: string;
}


export type UpdateTagDto = Partial<CreateTagDto>;


export interface TagWithCount {
    id: string;
    name: string;
    color?: string;
    icon?: string;
    transactionCount: number;
    totalAmount: number;
}
