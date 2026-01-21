import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Balance, SimplifiedDebt } from '@/types/split';

// Get all balances for a group
export function useGroupBalances(groupId: string) {
    return useQuery({
        queryKey: ['groups', groupId, 'balances'],
        queryFn: async () => {
            return await apiClient.get<Balance[]>(
                API_ENDPOINTS.GROUPS.BALANCES(groupId)
            );
        },
        enabled: !!groupId,
    });
}

// Get user's balance in a group
export function useUserBalance(groupId: string, userId: string) {
    return useQuery({
        queryKey: ['groups', groupId, 'balances', 'user', userId],
        queryFn: async () => {
            return await apiClient.get<Balance>(
                API_ENDPOINTS.GROUPS.USER_BALANCE(groupId, userId)
            );
        },
        enabled: !!groupId && !!userId,
    });
}

// Get simplified debts
export function useSimplifiedDebts(groupId: string) {
    return useQuery({
        queryKey: ['groups', groupId, 'simplified-debts'],
        queryFn: async () => {
            return await apiClient.get<SimplifiedDebt[]>(
                API_ENDPOINTS.GROUPS.SIMPLIFIED_DEBTS(groupId)
            );
        },
        enabled: !!groupId,
    });
}

// Settle a debt
export function useSettleDebt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            groupId: string;
            fromUserId: string;
            toUserId: string;
            amount: number;
            settledAt?: string;
            notes?: string;
        }) => {
            return await apiClient.post(
                API_ENDPOINTS.GROUPS.SETTLEMENTS(params.groupId),
                {
                    fromUserId: params.fromUserId,
                    toUserId: params.toUserId,
                    amount: params.amount,
                    settledAt: params.settledAt,
                    notes: params.notes,
                }
            );
        },
        onSuccess: (_, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'balances'] });
            queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'simplified-debts'] });
            queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'statistics'] });
        },
    });
}
