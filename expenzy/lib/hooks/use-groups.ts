import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import type { Group, GroupMember } from '@/types/group';

export interface CreateGroupData {
    name: string;
    description?: string;
    memberEmails?: string[];
    groupType?: string;
    iconSeed?: string;
    iconProvider?: string;
}

export interface UpdateGroupData {
    name?: string;
    description?: string;
}

// Get all groups
export function useGroups() {
    return useQuery({
        queryKey: ['groups'],
        queryFn: async () => {
            return await apiClient.get<Group[]>(API_ENDPOINTS.GROUPS.LIST);
        },
    });
}

// Get single group
export function useGroup(id: string) {
    return useQuery({
        queryKey: ['groups', id],
        queryFn: async () => {
            return await apiClient.get<Group>(`${API_ENDPOINTS.GROUPS.LIST}/${id}`);
        },
        enabled: !!id,
    });
}

// Create group
export function useCreateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateGroupData) => {
            return await apiClient.post<Group>(API_ENDPOINTS.GROUPS.LIST, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Group created successfully');
        },
        onError: () => {
            toast.error('Failed to create group');
        },
    });
}

// Update group
export function useUpdateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateGroupData }) => {
            return await apiClient.patch<Group>(
                `${API_ENDPOINTS.GROUPS.LIST}/${id}`,
                data
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['groups', variables.id] });
            toast.success('Group updated successfully');
        },
        onError: () => {
            toast.error('Failed to update group');
        },
    });
}

// Delete group
export function useDeleteGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`${API_ENDPOINTS.GROUPS.LIST}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Group deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete group');
        },
    });
}

// Get group members
export function useGroupMembers(groupId: string) {
    return useQuery({
        queryKey: ['groups', groupId, 'members'],
        queryFn: async () => {
            return await apiClient.get<GroupMember[]>(
                `${API_ENDPOINTS.GROUPS.LIST}/${groupId}/members`
            );
        },
        enabled: !!groupId,
    });
}

// Add group member
export function useAddGroupMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ groupId, email }: { groupId: string; email: string }) => {
            return await apiClient.post(
                `${API_ENDPOINTS.GROUPS.LIST}/${groupId}/members`,
                { email }
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'members'] });
            queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
            toast.success('Member added successfully');
        },
        onError: () => {
            toast.error('Failed to add member');
        },
    });
}

// Remove group member
export function useRemoveGroupMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ groupId, memberId }: { groupId: string; memberId: string }) => {
            await apiClient.delete(
                `${API_ENDPOINTS.GROUPS.LIST}/${groupId}/members/${memberId}`
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'members'] });
            queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
            toast.success('Member removed successfully');
        },
        onError: () => {
            toast.error('Failed to remove member');
        },
    });
}

// Leave group
export function useLeaveGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (groupId: string) => {
            await apiClient.post(`${API_ENDPOINTS.GROUPS.LIST}/${groupId}/leave`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('You have left the group');
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to leave group';
            toast.error(message);
        },
    });
}
