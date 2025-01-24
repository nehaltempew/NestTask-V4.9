import { supabase } from '../lib/supabase';
import type { User } from '../types/auth';
import type { UserStats } from '../types/user';

export async function fetchUsers(): Promise<User[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.user_metadata?.role || user.user_metadata.role !== 'admin') {
      return [];
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    // Handle empty data case
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(user => ({
      id: user.id,
      email: user.email || '',
      name: user.name || user.email?.split('@')[0] || '',
      role: user.role || 'user',
      createdAt: user.created_at
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function fetchUserStats(): Promise<UserStats> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.user_metadata?.role || user.user_metadata.role !== 'admin') {
      return {
        totalUsers: 0,
        activeToday: 0,
        newThisWeek: 0
      };
    }

    const { data, error } = await supabase.rpc('get_user_stats');
    
    if (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalUsers: 0,
        activeToday: 0,
        newThisWeek: 0
      };
    }
    
    return {
      totalUsers: data.total_users,
      activeToday: data.active_today,
      newThisWeek: data.new_this_week
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalUsers: 0,
      activeToday: 0,
      newThisWeek: 0
    };
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.user_metadata?.role || user.user_metadata.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can delete users');
    }

    // First delete from the users table
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting user from users table:', deleteError);
      throw deleteError;
    }

    // Then delete auth user through RPC
    const { error: rpcError } = await supabase
      .rpc('delete_user', { user_id: userId });

    if (rpcError) {
      console.error('Error deleting auth user:', rpcError);
      throw rpcError;
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error(error.message || 'Failed to delete user');
  }
}