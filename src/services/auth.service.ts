import { supabase } from '../lib/supabase';
import { getAuthErrorMessage } from '../utils/authErrors';
import type { LoginCredentials, SignupCredentials, User } from '../types/auth';

export async function loginUser({ email, password }: LoginCredentials): Promise<User> {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) throw error;
    if (!data?.user) throw new Error('No user data received');

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.email?.split('@')[0] || '',
            role: data.user.user_metadata?.role || 'user'
          })
          .select()
          .single();

        if (createError) throw createError;
        return {
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.role,
          createdAt: newProfile.created_at
        };
      }
      throw profileError;
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      createdAt: profile.created_at
    };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function signupUser({ email, password, name }: SignupCredentials): Promise<User> {
  try {
    // Validate inputs
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Create new user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'user',
        },
      },
    });
    
    if (error) throw error;
    if (!data?.user) throw new Error('No user data received');

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        name: name,
        role: 'user',
      })
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new Error('Failed to create user profile');
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      createdAt: profile.created_at
    };
  } catch (error: any) {
    // Check for duplicate email
    if (error.message?.includes('duplicate key') || 
        error.message?.includes('already registered')) {
      throw new Error('Email already registered');
    }
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear any local storage items
    localStorage.removeItem('supabase.auth.token');
  } catch (error: any) {
    throw new Error('Failed to sign out. Please try again.');
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
}