import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface PersonLoan {
    id: string;
    lenderUserId: string;
    borrowerUserId: string;
    amount: string;
    currency: string;
    description: string | null;
    loanDate: string;
    status: string;
    lender: {
        id: string;
        username: string;
        email: string;
        avatar: string | null;
        avatarUrl: string | null;
    };
    borrower: {
        id: string;
        username: string;
        email: string;
        avatar: string | null;
        avatarUrl: string | null;
    };
}

interface PersonLoansResponse {
    data: PersonLoan[];
    meta: {
        nextCursor: string | null;
        hasMore: boolean;
        limit: number;
    };
}

export function usePersonLoans(personId: string) {
    return useInfiniteQuery<PersonLoansResponse>({
        queryKey: ['person-loans', personId],
        queryFn: async ({ pageParam }): Promise<PersonLoansResponse> => {
            const params = new URLSearchParams();
            params.append('limit', '50');
            if (pageParam) {
                params.append('cursor', pageParam as string);
            }

            // Use getRaw to get the full response object
            const response = await apiClient.getRaw<PersonLoansResponse>(
                `/loans/person/${personId}?${params.toString()}`
            );
            return response;
        },
        getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? null,
        initialPageParam: undefined,
    });
}
