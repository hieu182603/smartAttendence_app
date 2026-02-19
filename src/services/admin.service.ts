import api from '../libs/axios';

export const AdminService = {
    // Departments
    getDepartments: async () => {
        const response = await api.get('/departments');
        return response.data.departments; // API returns { departments: [], total, ... }
    },

    createDepartment: async (data: any) => {
        const response = await api.post('/departments', data);
        return response.data.department;
    },

    updateDepartment: async (id: string, data: any) => {
        const response = await api.put(`/departments/${id}`, data);
        return response.data.department;
    },

    deleteDepartment: async (id: string) => {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    },

    // Positions
    getPositions: async () => {
        try {
            const response = await api.get('/positions');
            return response.data.positions || response.data;
        } catch (e) {
            console.log('Error fetching positions, using defaults', e);
            return [];
        }
    },

    // Utils for dropdowns
    getManagers: async () => {
        const response = await api.get('/users/managers');
        return response.data; // Assuming array of users
    },

    getBranches: async () => {
        const response = await api.get('/branches/list');
        return response.data; // Assuming array of branches
    },

    // Settings
    getSystemSettings: async () => {
        try {
            const response = await api.get('/settings');
            return response.data;
        } catch (e) {
            console.log('Error fetching settings, using defaults', e);
            return {
                workStartTime: '08:00',
                workEndTime: '17:00',
                allowedLateMinutes: 15
            };
        }
    }
};
