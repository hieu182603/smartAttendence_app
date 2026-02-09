import api from '../libs/axios';

export const ManagerService = {
    getStats: async () => {
        const response = await api.get('/manager/stats');
        return response.data;
    },

    getTeam: async () => {
        const response = await api.get('/manager/team');
        return response.data;
    },

    getApprovals: async (params: { status?: string; page?: number; limit?: number }) => {
        const response = await api.get('/manager/approvals', { params });
        return response.data;
    },

    approveRequest: async (id: string, data?: { reason?: string }) => {
        const response = await api.put(`/manager/approvals/${id}/approve`, data);
        return response.data;
    },

    rejectRequest: async (id: string, data: { reason: string }) => {
        const response = await api.put(`/manager/approvals/${id}/reject`, data);
        return response.data;
    },

    getDepartmentSchedule: async (month: number, year: number) => {
        const response = await api.get('/manager/schedule', { params: { month, year } });
        return response.data;
    },
};
