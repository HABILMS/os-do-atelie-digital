
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_ADMIN_EMAIL = "admin@admin.com";
export const DEFAULT_ADMIN_PASSWORD = "123";

export const createDefaultAdminUser = async () => {
  try {
    // Try to sign up the default admin user
    const { data, error } = await supabase.auth.signUp({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      options: {
        data: {
          name: 'Admin'
        }
      }
    });

    if (error && error.message !== 'User already registered') {
      console.error('Error creating admin user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createDefaultAdminUser:', error);
    return false;
  }
};

export const signInWithDefaultAdmin = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
    });

    if (error) {
      // If login fails, try to create the admin user first
      await createDefaultAdminUser();
      
      // Then try to login again
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      });

      if (retryError) {
        throw retryError;
      }

      return retryData;
    }

    return data;
  } catch (error) {
    console.error('Error in signInWithDefaultAdmin:', error);
    throw error;
  }
};
