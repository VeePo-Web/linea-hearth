import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types/account';
import { toast } from 'sonner';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to update profile');
        return { error };
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { error: err as Error };
    }
  };

  return { profile, isLoading, updateProfile };
}
