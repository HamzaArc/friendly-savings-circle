
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Profile } from './users';

export type Group = {
  id: string;
  name: string;
  description?: string;
  contribution_amount: number;
  contribution_frequency: string;
  max_members: number;
  current_cycle: number;
  total_cycles: number;
  is_public: boolean;
  allow_join_requests: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  is_admin: boolean;
  joined_at?: string;
  profiles?: Profile;
};

export const createGroup = async (groupData: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group | null> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .insert([groupData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Create a group member record for the creator as admin
    if (data && groupData.created_by) {
      await addGroupMember(data.id, groupData.created_by, true);
    }
    
    toast({
      title: "Group created",
      description: `Your group "${data.name}" has been created successfully.`
    });
    
    return data;
  } catch (error: any) {
    console.error('Error creating group:', error.message);
    toast({
      title: "Error creating group",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const getGroups = async (userId?: string): Promise<Group[]> => {
  try {
    let query = supabase.from('groups').select(`
      *,
      group_members!inner(user_id)
    `);
    
    if (userId) {
      query = query.eq('group_members.user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Transform the data to match the expected Group type
    const groups = data.map(item => ({
      ...item,
      // Extract only the group properties
      id: item.id,
      name: item.name,
      description: item.description,
      contribution_amount: item.contribution_amount,
      contribution_frequency: item.contribution_frequency,
      max_members: item.max_members,
      current_cycle: item.current_cycle,
      total_cycles: item.total_cycles,
      is_public: item.is_public,
      allow_join_requests: item.allow_join_requests,
      created_by: item.created_by,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
    
    return groups;
  } catch (error: any) {
    console.error('Error fetching groups:', error.message);
    return [];
  }
};

export const getGroup = async (groupId: string): Promise<{ group: Group | null, members: GroupMember[] }> => {
  try {
    // Get the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (groupError) throw groupError;
    
    // Get the members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        *,
        profiles:profiles(*)
      `)
      .eq('group_id', groupId);
    
    if (membersError) throw membersError;
    
    return { 
      group, 
      members: members || [] 
    };
  } catch (error: any) {
    console.error('Error fetching group:', error.message);
    return { group: null, members: [] };
  }
};

export const updateGroup = async (groupId: string, groupData: Partial<Group>): Promise<Group | null> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .update(groupData)
      .eq('id', groupId)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Group updated",
      description: `Group "${data.name}" has been updated successfully.`
    });
    
    return data;
  } catch (error: any) {
    console.error('Error updating group:', error.message);
    toast({
      title: "Error updating group",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const deleteGroup = async (groupId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
    
    if (error) throw error;
    
    toast({
      title: "Group deleted",
      description: "The group has been deleted successfully."
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting group:', error.message);
    toast({
      title: "Error deleting group",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

// Group members functions
export const addGroupMember = async (groupId: string, userId: string, isAdmin: boolean = false): Promise<GroupMember | null> => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: userId, is_admin: isAdmin }])
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Member added",
      description: "New member has been added to the group."
    });
    
    return data;
  } catch (error: any) {
    console.error('Error adding group member:', error.message);
    toast({
      title: "Error adding member",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const removeGroupMember = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    toast({
      title: "Member removed",
      description: "Member has been removed from the group."
    });
    
    return true;
  } catch (error: any) {
    console.error('Error removing group member:', error.message);
    toast({
      title: "Error removing member",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

export const updateGroupMember = async (groupId: string, userId: string, updateData: Partial<GroupMember>): Promise<GroupMember | null> => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .update(updateData)
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Member updated",
      description: "Member information has been updated."
    });
    
    return data;
  } catch (error: any) {
    console.error('Error updating group member:', error.message);
    toast({
      title: "Error updating member",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profiles:profiles(*)
      `)
      .eq('group_id', groupId);
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching group members:', error.message);
    return [];
  }
};
