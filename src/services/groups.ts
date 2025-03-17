
import { supabase } from '@/lib/supabase';

export const createGroup = async (groupData: any) => {
  const { data, error } = await supabase
    .from('groups')
    .insert([groupData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getGroups = async (userId?: string) => {
  let query = supabase.from('groups').select(`
    *,
    group_members!inner(user_id)
  `);
  
  if (userId) {
    query = query.eq('group_members.user_id', userId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getGroup = async (groupId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_members(*)
    `)
    .eq('id', groupId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateGroup = async (groupId: string, groupData: any) => {
  const { data, error } = await supabase
    .from('groups')
    .update(groupData)
    .eq('id', groupId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteGroup = async (groupId: string) => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);
  
  if (error) throw error;
  return true;
};

// Group members
export const addGroupMember = async (groupId: string, userId: string, isAdmin: boolean = false) => {
  const { data, error } = await supabase
    .from('group_members')
    .insert([{ group_id: groupId, user_id: userId, is_admin: isAdmin }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const removeGroupMember = async (groupId: string, userId: string) => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  
  if (error) throw error;
  return true;
};

export const updateGroupMember = async (groupId: string, userId: string, updateData: any) => {
  const { data, error } = await supabase
    .from('group_members')
    .update(updateData)
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getGroupMembers = async (groupId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      profiles:user_id(*)
    `)
    .eq('group_id', groupId);
  
  if (error) throw error;
  return data;
};
