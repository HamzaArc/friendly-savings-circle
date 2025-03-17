
import { supabase } from "@/integrations/supabase/client";

/**
 * This function can be called to set up initial data and structures
 * in the database if needed.
 */
export const initializeDatabase = async () => {
  try {
    // Check if tables exist and are accessible
    const { error: groupsError } = await supabase
      .from('groups')
      .select('id')
      .limit(1);
      
    if (groupsError) {
      console.error("Error accessing groups table:", groupsError);
      return false;
    }
    
    const { error: membersError } = await supabase
      .from('group_members')
      .select('id')
      .limit(1);
      
    if (membersError) {
      console.error("Error accessing group_members table:", membersError);
      return false;
    }
    
    const { error: cyclesError } = await supabase
      .from('cycles')
      .select('id')
      .limit(1);
      
    if (cyclesError) {
      console.error("Error accessing cycles table:", cyclesError);
      return false;
    }
    
    const { error: paymentsError } = await supabase
      .from('payments')
      .select('id')
      .limit(1);
      
    if (paymentsError) {
      console.error("Error accessing payments table:", paymentsError);
      return false;
    }
    
    const { error: notificationsError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);
      
    if (notificationsError) {
      console.error("Error accessing notifications table:", notificationsError);
      return false;
    }
    
    console.log("Database structure verified successfully!");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

// Add a check for database connectivity
export const checkDatabaseConnectivity = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error("Database connectivity check failed:", error);
      return false;
    }
    console.log("Database connectivity check passed!");
    return true;
  } catch (error) {
    console.error("Database connectivity check failed with exception:", error);
    return false;
  }
};
