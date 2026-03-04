import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ManagerService } from '../services/manager.service';
import { queryKeys } from './queryKeys';

/**
 * Hook to fetch manager dashboard stats
 */
export function useManagerStats() {
    return useQuery({
        queryKey: queryKeys.manager.stats(),
        queryFn: () => ManagerService.getStats(),
    });
}

/**
 * Hook to fetch team members
 */
export function useTeamMembers() {
    return useQuery({
        queryKey: queryKeys.manager.team(),
        queryFn: () => ManagerService.getTeam(),
    });
}

/**
 * Hook to fetch approval requests with optional filters
 */
export function useManagerApprovals(params?: { status?: string; page?: number; limit?: number }) {
    return useQuery({
        queryKey: queryKeys.manager.approvals(params),
        queryFn: () => ManagerService.getApprovals(params || {}),
    });
}

/**
 * Hook to fetch manager reports
 */
export function useManagerReports(period: 'day' | 'week' | 'month' = 'day') {
    return useQuery({
        queryKey: queryKeys.manager.reports(period),
        queryFn: () => ManagerService.getReports(period),
        staleTime: 2 * 60 * 1000, // 2 min
    });
}

/**
 * Mutation hook to approve a request.
 * Invalidates approvals list on success.
 */
export function useApproveRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, note }: { id: string; note?: string }) =>
            ManagerService.approveRequest(id, { reason: note }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.manager.approvals() });
        },
    });
}

/**
 * Mutation hook to reject a request.
 * Invalidates approvals list on success.
 */
export function useRejectRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, note }: { id: string; note: string }) =>
            ManagerService.rejectRequest(id, { reason: note }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.manager.approvals() });
        },
    });
}
