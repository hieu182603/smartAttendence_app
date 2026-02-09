import api from '../libs/axios';

// Mock data
let MOCK_DEPARTMENTS = [
    { id: 'dep-001', name: 'Nhân sự', description: 'Quản lý nhân sự và tuyển dụng', head: 'Nguyen Van A' },
    { id: 'dep-002', name: 'Marketing', description: 'Tiếp thị và quảng cáo', head: 'Tran Thi B' },
    { id: 'dep-003', name: 'Kỹ thuật', description: 'Phát triển phần mềm', head: 'Le Van C' },
];

let MOCK_POSITIONS = [
    { id: 'pos-001', title: 'Giám đốc', level: 1 },
    { id: 'pos-002', title: 'Trưởng phòng', level: 2 },
    { id: 'pos-003', title: 'Nhân viên', level: 3 },
    { id: 'pos-004', title: 'Thực tập sinh', level: 4 },
];

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
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_POSITIONS;
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
        return {
            workStartTime: '08:00',
            workEndTime: '17:00',
            allowedLateMinutes: 15
        };
    }
};
