import { X, UserCheck, Calendar } from 'lucide-react';
import type { User } from '../../../types/auth';

interface ActiveUsersModalProps {
  users: User[];
  type: 'active' | 'new';
  onClose: () => void;
}

export function ActiveUsersModal({ users, type, onClose }: ActiveUsersModalProps) {
  const filteredUsers = users.filter(user => {
    const userDate = new Date(type === 'active' ? user.lastActive || user.createdAt : user.createdAt);
    const now = new Date();
    
    if (type === 'active') {
      // Active today - within last 24 hours
      return (now.getTime() - userDate.getTime()) < (24 * 60 * 60 * 1000);
    } else {
      // New this week - within last 7 days
      return (now.getTime() - userDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
    }
  });

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-xl z-50 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              {type === 'active' ? (
                <UserCheck className="w-5 h-5 text-blue-600" />
              ) : (
                <Calendar className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {type === 'active' ? 'Active Users Today' : 'New Users This Week'}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredUsers.length} users
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500">No users found</p>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(type === 'active' ? user.lastActive || user.createdAt : user.createdAt)
                        .toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}