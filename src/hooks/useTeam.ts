import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '../types';

interface UseTeamReturn {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  onlineCount: number;
  onLeaveCount: number;
}

// Mock team members data
import { UserRole } from '../types';

const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Nguyễn Văn B',
    role: UserRole.Employee,
    department: 'Phát triển',
    status: 'online',
  },
  {
    id: '2',
    name: 'Trần Thị C',
    role: UserRole.Employee,
    department: 'Phát triển',
    status: 'on-leave',
  },
  {
    id: '3',
    name: 'Lê Văn D',
    role: UserRole.Employee,
    department: 'Marketing',
    status: 'online',
  },
  {
    id: '4',
    name: 'Phạm Thị E',
    role: UserRole.Employee,
    department: 'Phát triển',
    status: 'offline',
  },
];

export function useTeam(): UseTeamReturn {
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setMembers(mockMembers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load team members';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onlineCount = members.filter(m => m.status === 'online').length;
  const onLeaveCount = members.filter(m => m.status === 'on-leave').length;

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    isLoading,
    error,
    refresh: fetchMembers,
    onlineCount,
    onLeaveCount,
  };
}

