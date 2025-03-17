
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Profile } from './users';

export type Cycle = {
  id: string;
  group_id: string;
  cycle_number: number;
  recipient_id: string;
  start_date: string;
  end_date: string;
  payment_date: string;
  first_reminder_date?: string;
  second_reminder_date?: string;
  status: 'upcoming' | 'active' | 'completed';
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  recipient?: Profile;
  payments?: any[];
};

export const createCycle = async (cycleData: Omit<Cycle, 'id' | 'created_at'>): Promise<Cycle | null> => {
  try {
    const { data, error } = await supabase
      .from('cycles')
      .insert([cycleData])
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Cycle created",
      description: `Cycle ${cycleData.cycle_number} has been created successfully.`
    });
    
    return {
      ...data,
      status: data.status as 'upcoming' | 'active' | 'completed'
    };
  } catch (error: any) {
    console.error('Error creating cycle:', error.message);
    toast({
      title: "Error creating cycle",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const getCycles = async (groupId: string): Promise<Cycle[]> => {
  try {
    const { data, error } = await supabase
      .from('cycles')
      .select(`
        *,
        recipient:profiles!recipient_id(*)
      `)
      .eq('group_id', groupId)
      .order('cycle_number', { ascending: true });
    
    if (error) throw error;
    return data ? data.map(cycle => ({
      ...cycle,
      status: cycle.status as 'upcoming' | 'active' | 'completed'
    })) : [];
  } catch (error: any) {
    console.error('Error fetching cycles:', error.message);
    return [];
  }
};

export const getCycle = async (cycleId: string): Promise<Cycle | null> => {
  try {
    const { data, error } = await supabase
      .from('cycles')
      .select(`
        *,
        recipient:profiles!recipient_id(*),
        payments(*)
      `)
      .eq('id', cycleId)
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      status: data.status as 'upcoming' | 'active' | 'completed'
    } : null;
  } catch (error: any) {
    console.error('Error fetching cycle:', error.message);
    return null;
  }
};

export const updateCycle = async (cycleId: string, cycleData: Partial<Cycle>): Promise<Cycle | null> => {
  try {
    const { data, error } = await supabase
      .from('cycles')
      .update(cycleData)
      .eq('id', cycleId)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Cycle updated",
      description: `Cycle ${data.cycle_number} has been updated successfully.`
    });
    
    return {
      ...data,
      status: data.status as 'upcoming' | 'active' | 'completed'
    };
  } catch (error: any) {
    console.error('Error updating cycle:', error.message);
    toast({
      title: "Error updating cycle",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const deleteCycle = async (cycleId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cycles')
      .delete()
      .eq('id', cycleId);
    
    if (error) throw error;
    
    toast({
      title: "Cycle deleted",
      description: "The cycle has been deleted successfully."
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting cycle:', error.message);
    toast({
      title: "Error deleting cycle",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

export const activateNextCycle = async (groupId: string): Promise<Cycle | null> => {
  try {
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
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', activeCycle.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Cycle completed",
        description: `Cycle ${activeCycle.cycle_number} has been marked as completed.`
      });
    }
    
    // Find the next cycle to activate
    const { data: nextCycle, error: nextCycleError } = await supabase
      .from('cycles')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'upcoming')
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
      
      toast({
        title: "New cycle activated",
        description: `Cycle ${nextCycle.cycle_number} is now active.`
      });
      
      return data ? {
        ...data,
        status: data.status as 'upcoming' | 'active' | 'completed'
      } : null;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error activating next cycle:', error.message);
    toast({
      title: "Error activating cycle",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const getActiveCycle = async (groupId: string): Promise<Cycle | null> => {
  try {
    const { data, error } = await supabase
      .from('cycles')
      .select(`
        *,
        recipient:profiles!recipient_id(*),
        payments(*)
      `)
      .eq('group_id', groupId)
      .eq('status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? {
      ...data,
      status: data.status as 'upcoming' | 'active' | 'completed'
    } : null;
  } catch (error: any) {
    console.error('Error fetching active cycle:', error.message);
    return null;
  }
};
