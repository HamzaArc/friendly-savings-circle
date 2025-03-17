
import { supabase } from "@/integrations/supabase/client";

// Helper to get user profile by ID
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  
  return data;
};

// Helper to check if a user is an admin of a group
export const isGroupAdmin = async (groupId: string, userId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .select('is_admin')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
  
  return data?.is_admin || false;
};

// Helper to send a notification to a user
export const sendNotification = async (
  userId: string, 
  message: string, 
  type: string, 
  groupId?: string, 
  cycleId?: string
) => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      message,
      type,
      group_id: groupId,
      cycle_id: cycleId
    });
    
  if (error) {
    console.error("Error sending notification:", error);
    return false;
  }
  
  return true;
};

// Helper to get group details
export const getGroupDetails = async (groupId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();
    
  if (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
  
  return data;
};

// Helper to get group members
export const getGroupMembers = async (groupId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id, is_admin')
    .eq('group_id', groupId);
    
  if (error) {
    console.error("Error fetching group members:", error);
    return [];
  }
  
  // Get profiles for all members
  const memberProfiles = await Promise.all(
    data.map(async (member) => {
      const profile = await getUserProfile(member.user_id);
      return {
        userId: member.user_id,
        isAdmin: member.is_admin,
        name: profile?.name || "Unknown User",
        email: profile?.email || ""
      };
    })
  );
  
  return memberProfiles;
};

// Helper to get active cycle for a group
export const getActiveCycle = async (groupId: string) => {
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'active')
    .maybeSingle();
    
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching active cycle:", error);
    return null;
  }
  
  return data;
};

// Helper to create a cycle for a group
export const createCycle = async (
  groupId: string, 
  cycleNumber: number, 
  recipientId: string
) => {
  const startDate = new Date();
  // Default end date is one month from now
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  
  const { data, error } = await supabase
    .from('cycles')
    .insert({
      group_id: groupId,
      number: cycleNumber,
      recipient_id: recipientId,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating cycle:", error);
    return null;
  }
  
  return data;
};

// Helper to update group cycle information
export const updateGroupCycleInfo = async (
  groupId: string,
  currentCycle: number,
  nextPaymentDate?: string
) => {
  const { error } = await supabase
    .from('groups')
    .update({
      current_cycle: currentCycle,
      next_payment_date: nextPaymentDate
    })
    .eq('id', groupId);
    
  if (error) {
    console.error("Error updating group cycle info:", error);
    return false;
  }
  
  return true;
};
