import { useState, useEffect, useCallback } from 'react';
import { ApprovalRequest } from '../types';

interface UseApprovalsReturn {
  approvals: ApprovalRequest[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  approve: (id: string, note?: string) => Promise<void>;
  reject: (id: string, note: string) => Promise<void>;
  pendingCount: number;
}

// Mock approvals data
const mockApprovals: ApprovalRequest[] = [
  {
    id: '1',
    userId: 'user-1',
    employeeName: 'Nguyễn Văn B',
    type: 'annual',
    startDate: '20/12/2024',
    endDate: '22/12/2024',
    days: 3,
    reason: 'Nghỉ phép cuối năm',
    status: 'pending',
    submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: '2',
    userId: 'user-2',
    employeeName: 'Trần Thị C',
    type: 'sick',
    startDate: '18/12/2024',
    endDate: '19/12/2024',
    days: 2,
    reason: 'Nghỉ ốm',
    status: 'pending',
    submittedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

export function useApprovals(): UseApprovalsReturn {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(mockApprovals);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setApprovals(mockApprovals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load approvals';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approve = useCallback(async (id: string, note?: string) => {
    try {
      // Remove from list after approval
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error approving request:', err);
      throw err;
    }
  }, []);

  const reject = useCallback(async (id: string, note: string) => {
    try {
      // Remove from list after rejection
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error rejecting request:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  return {
    approvals,
    isLoading,
    error,
    refresh: fetchApprovals,
    approve,
    reject,
    pendingCount: approvals.length,
  };
}

