
import { supabase } from '@/lib/supabase';

export const createCycle = async (cycleData: any) => {
  const { data, error } = await supabase
    .from('cycles')
    .insert([cycleData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getCycles = async (groupId: string) => {
  const { data, error } = await supabase
    .from('cycles')
    .select(`
      *,
      recipient:recipient_id(*)
    `)
    .eq('group_id', groupId)
    .order('cycle_number', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const getCycle = async (cycleId: string) => {
  const { data, error } = await supabase
    .from('cycles')
    .select(`
      *,
      recipient:recipient_id(*),
      payments(*)
    `)
    .eq('id', cycleId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCycle = async (cycleId: string, cycleData: any) => {
  const { data, error } = await supabase
    .from('cycles')
    .update(cycleData)
    .eq('id', cycleId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteCycle = async (cycleId: string) => {
  const { error } = await supabase
    .from('cycles')
    .delete()
    .eq('id', cycleId);
  
  if (error) throw error;
  return true;
};

export const activateNextCycle = async (groupId: string) => {
  // Get the current active cycle
  const { data: activeCycle, error: getCycleError } = await supabase
    .from('cycles')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'active')
    .single();
  
  if (getCycleError && getCycleError.code !== 'PGRST116') throw getCycleError;
  
  // If there's an active cycle, complete it
  if (activeCycle) {
    const { error: updateError } = await supabase
      .from('cycles')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', activeCycle.id);
    
    if (updateError) throw updateError;
  }
  
  // Find the next cycle to activate
  const { data: nextCycle, error: nextCycleError } = await supabase
    .from('cycles')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('cycle_number', { ascending: true })
    .limit(1)
    .single();
  
  if (nextCycleError && nextCycleError.code !== 'PGRST116') throw nextCycleError;
  
  // If there's a next cycle, activate it
  if (nextCycle) {
    const { data, error: activateError } = await supabase
      .from('cycles')
      .update({ 
        status: 'active', 
        started_at: new Date().toISOString()
      })
      .eq('id', nextCycle.id)
      .select()
      .single();
    
    if (activateError) throw activateError;
    return data;
  }
  
  return null;
};

export const getActiveCycle = async (groupId: string) => {
  const { data, error } = await supabase
    .from('cycles')
    .select(`
      *,
      recipient:recipient_id(*),
      payments(*)
    `)
    .eq('group_id', groupId)
    .eq('status', 'active')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
