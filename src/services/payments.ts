
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Profile } from './users';

export type Payment = {
  id: string;
  cycle_id: string;
  payer_id: string;
  amount: number;
  status: 'pending' | 'paid';
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
  payer?: Profile;
  cycles?: any;
};

export const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Payment created",
      description: "A new payment has been created."
    });
    
    return data ? {
      ...data,
      status: data.status as 'pending' | 'paid'
    } : null;
  } catch (error: any) {
    console.error('Error creating payment:', error.message);
    toast({
      title: "Error creating payment",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const getPayments = async (cycleId?: string, userId?: string): Promise<Payment[]> => {
  try {
    let query = supabase.from('payments').select(`
      *,
      cycles(*),
      payer:profiles!payer_id(*)
    `);
    
    if (cycleId) {
      query = query.eq('cycle_id', cycleId);
    }
    
    if (userId) {
      query = query.eq('payer_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(payment => ({
      ...payment,
      status: payment.status as 'pending' | 'paid'
    })) : [];
  } catch (error: any) {
    console.error('Error fetching payments:', error.message);
    return [];
  }
};

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        cycles(*),
        payer:profiles!payer_id(*)
      `)
      .eq('id', paymentId)
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      status: data.status as 'pending' | 'paid'
    } : null;
  } catch (error: any) {
    console.error('Error fetching payment:', error.message);
    return null;
  }
};

export const updatePayment = async (paymentId: string, paymentData: Partial<Payment>): Promise<Payment | null> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update(paymentData)
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Payment updated",
      description: "The payment has been updated successfully."
    });
    
    return data ? {
      ...data,
      status: data.status as 'pending' | 'paid'
    } : null;
  } catch (error: any) {
    console.error('Error updating payment:', error.message);
    toast({
      title: "Error updating payment",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const deletePayment = async (paymentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);
    
    if (error) throw error;
    
    toast({
      title: "Payment deleted",
      description: "The payment has been deleted successfully."
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting payment:', error.message);
    toast({
      title: "Error deleting payment",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

export const getUserPaymentsForCycle = async (cycleId: string, userId: string): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('cycle_id', cycleId)
      .eq('payer_id', userId);
    
    if (error) throw error;
    return data ? data.map(payment => ({
      ...payment,
      status: payment.status as 'pending' | 'paid'
    })) : [];
  } catch (error: any) {
    console.error('Error fetching user payments for cycle:', error.message);
    return [];
  }
};

export const confirmPayment = async (paymentId: string): Promise<Payment | null> => {
  try {
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
    
    toast({
      title: "Payment confirmed",
      description: "The payment has been confirmed successfully."
    });
    
    return data ? {
      ...data,
      status: data.status as 'pending' | 'paid'
    } : null;
  } catch (error: any) {
    console.error('Error confirming payment:', error.message);
    toast({
      title: "Error confirming payment",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};
