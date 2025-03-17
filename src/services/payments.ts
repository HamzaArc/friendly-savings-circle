
import { supabase } from '@/lib/supabase';

export const createPayment = async (paymentData: any) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getPayments = async (cycleId?: string, userId?: string) => {
  let query = supabase.from('payments').select(`
    *,
    cycles!inner(*),
    payer:payer_id(*)
  `);
  
  if (cycleId) {
    query = query.eq('cycle_id', cycleId);
  }
  
  if (userId) {
    query = query.eq('payer_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getPayment = async (paymentId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      cycles(*),
      payer:payer_id(*)
    `)
    .eq('id', paymentId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updatePayment = async (paymentId: string, paymentData: any) => {
  const { data, error } = await supabase
    .from('payments')
    .update(paymentData)
    .eq('id', paymentId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deletePayment = async (paymentId: string) => {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId);
  
  if (error) throw error;
  return true;
};

export const getUserPaymentsForCycle = async (cycleId: string, userId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('cycle_id', cycleId)
    .eq('payer_id', userId);
  
  if (error) throw error;
  return data;
};

export const confirmPayment = async (paymentId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', paymentId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
