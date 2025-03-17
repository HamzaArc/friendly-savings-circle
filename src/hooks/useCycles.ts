
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCycles, 
  getCycle, 
  createCycle, 
  updateCycle, 
  deleteCycle, 
  activateNextCycle,
  getActiveCycle 
} from '@/services/cycles';
import { useToast } from '@/hooks/use-toast';

// Hook for fetching all cycles for a group
export const useCycles = (groupId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['cycles', groupId],
    queryFn: () => getCycles(groupId),
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error fetching cycles",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    enabled: !!groupId,
  });
};

// Hook for fetching a single cycle
export const useCycle = (cycleId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['cycles', 'detail', cycleId],
    queryFn: () => getCycle(cycleId),
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error fetching cycle",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    enabled: !!cycleId,
  });
};

// Hook for creating a new cycle
export const useCreateCycle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (cycleData: any) => createCycle(cycleData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cycles', variables.group_id] });
      toast({
        title: "Cycle created",
        description: "The cycle has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating cycle",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for updating a cycle
export const useUpdateCycle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ cycleId, data }: { cycleId: string, data: any }) => updateCycle(cycleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cycles', 'detail', variables.cycleId] });
      // We need to know the group_id to invalidate the cycles list
      const groupId = variables.data.group_id;
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ['cycles', groupId] });
      }
      toast({
        title: "Cycle updated",
        description: "The cycle has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating cycle",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for deleting a cycle
export const useDeleteCycle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ cycleId, groupId }: { cycleId: string, groupId: string }) => deleteCycle(cycleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cycles', variables.groupId] });
      toast({
        title: "Cycle deleted",
        description: "The cycle has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting cycle",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for activating the next cycle
export const useActivateNextCycle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (groupId: string) => activateNextCycle(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['cycles', groupId] });
      queryClient.invalidateQueries({ queryKey: ['cycles', 'active', groupId] });
      toast({
        title: "Next cycle activated",
        description: "The next cycle has been activated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error activating next cycle",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for fetching the active cycle for a group
export const useActiveCycle = (groupId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['cycles', 'active', groupId],
    queryFn: () => getActiveCycle(groupId),
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error fetching active cycle",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    enabled: !!groupId,
  });
};
