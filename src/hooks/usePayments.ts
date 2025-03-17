
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPayments, 
  getPayment, 
  createPayment, 
  updatePayment, 
  deletePayment,
  confirmPayment,
  getUserPaymentsForCycle
} from '@/services/payments';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Hook for fetching all payments
export const usePayments = (cycleId?: string, userId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['payments', { cycleId, userId }],
    queryFn: () => getPayments(cycleId, userId),
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error fetching payments",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });
};

// Hook for fetching a single payment
export const usePayment = (paymentId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['payments', 'detail', paymentId],
    queryFn: () => getPayment(paymentId),
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error fetching payment",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    enabled: !!paymentId,
  });
};

// Hook for creating a new payment
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (paymentData: any) => createPayment({
      ...paymentData,
      payer_id: user?.id,
      status: 'pending',
      created_at: new Date().toISOString()
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['cycles', 'detail', data.cycle_id] });
      toast({
        title: "Payment created",
        description: "Your payment has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating payment",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for updating a payment
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string, data: any }) => updatePayment(paymentId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['cycles', 'detail', data.cycle_id] });
      toast({
        title: "Payment updated",
        description: "The payment has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating payment",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for deleting a payment
export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ paymentId, cycleId }: { paymentId: string, cycleId: string }) => deletePayment(paymentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['cycles', 'detail', variables.cycleId] });
      toast({
        title: "Payment deleted",
        description: "The payment has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting payment",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for confirming a payment
export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ paymentId, cycleId }: { paymentId: string, cycleId: string }) => confirmPayment(paymentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['cycles', 'detail', variables.cycleId] });
      toast({
        title: "Payment confirmed",
        description: "The payment has been confirmed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error confirming payment",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for fetching user payments for a specific cycle
export const useUserPaymentsForCycle = (cycleId: string, userId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['payments', 'user', userId, 'cycle', cycleId],
    queryFn: () => getUserPaymentsForCycle(cycleId, userId),
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error fetching user payments",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    enabled: !!cycleId && !!userId,
  });
};
