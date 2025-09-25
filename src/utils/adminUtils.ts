import { supabase } from '@/integrations/supabase/client';

export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin || false;
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return false;
  }
};

export const makeUserAdmin = async (userEmail: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('make_user_admin', {
      user_email: userEmail
    });

    if (error) {
      console.error('Error making user admin:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in makeUserAdmin:', error);
    return { success: false, error: 'Erro inesperado' };
  }
};

export const verifyAdminPermissions = async (userId: string): Promise<{
  isAdmin: boolean;
  profileExists: boolean;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { isAdmin: false, profileExists: false, error: 'Perfil não encontrado' };
      }
      return { isAdmin: false, profileExists: false, error: error.message };
    }

    return {
      isAdmin: data?.is_admin || false,
      profileExists: true
    };
  } catch (error) {
    console.error('Error in verifyAdminPermissions:', error);
    return { isAdmin: false, profileExists: false, error: 'Erro inesperado' };
  }
};

