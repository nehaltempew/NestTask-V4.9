import { useState } from 'react';
import { Users, UserCheck, Clock, ListTodo } from 'lucide-react';
import { useUserStats } from '../../hooks/useUserStats';
import { UserStatsCard } from './stats/UserStatsCard';
import { UserDetailsModal } from './users/UserDetailsModal';
import { TaskDetailsModal } from './task/TaskDetailsModal';
import { ActiveUsersModal } from './stats/ActiveUsersModal';
import type { User } from '../../types/auth';
import type { Task } from '../../types';

interface UserStatsProps {
  users: User[];
  tasks: Task[];
}

export function UserStats({ users, tasks }: UserStatsProps) {
  const { stats, loading } = useUserStats();
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showActiveUsers, setShowActiveUsers] = useState<'active' | 'new' | null>(null);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue' as const,
      onClick: () => setShowUserDetails(true)
    },
    {
      title: 'Active Today',
      value: stats.activeToday,
      icon: UserCheck,
      color: 'green' as const,
      onClick: () => setShowActiveUsers('active')
    },
    {
      title: 'New This Week',
      value: stats.newThisWeek,
      icon: Clock,
      color: 'purple' as const,
      onClick: () => setShowActiveUsers('new')
    },
    {
      title: 'Total Tasks',
      value: tasks.length,
      icon: ListTodo,
      color: 'indigo' as const,
      onClick: () => setShowTaskDetails(true)
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <UserStatsCard
            key={card.title}
            {...card}
            loading={loading}
          />
        ))}
      </div>

      {showUserDetails && (
        <UserDetailsModal
          users={users}
          onClose={() => setShowUserDetails(false)}
        />
      )}

      {showTaskDetails && (
        <TaskDetailsModal
          tasks={tasks}
          onClose={() => setShowTaskDetails(false)}
        />
      )}

      {showActiveUsers && (
        <ActiveUsersModal
          users={users}
          type={showActiveUsers}
          onClose={() => setShowActiveUsers(null)}
        />
      )}
    </>
  );
}