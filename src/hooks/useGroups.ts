
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getGroups, 
  getGroup, 
  createGroup, 
  updateGroup, 
  deleteGroup, 
  getGroupMembers 
} from '@/services/groups';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Hook for fetching all groups the current user is a member of
export const useGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => getGroups(user?.id),
    onError: (error: any) => {
      toast({
        title: "Error fetching groups",
        description: error.message,
        variant: "destructive",
      });
    },
    enabled: !!user,
  });
};

// Hook for fetching a single group
export const useGroup = (groupId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => getGroup(groupId),
    onError: (error: any) => {
      toast({
        title: "Error fetching group",
        description: error.message,
        variant: "destructive",
      });
    },
    enabled: !!groupId,
  });
};

// Hook for creating a new group
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (groupData: any) => {
      // Make sure we add the current user as an admin member when creating a group
      return createGroup({
        ...groupData,
        created_by: user?.id,
      }).then(async (group) => {
        // Add the current user as an admin member
        await queryClient.invalidateQueries({ queryKey: ['groups'] });
        return group;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: "Group created",
        description: "Your group has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating group",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for updating a group
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string, data: any }) => updateGroup(groupId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: "Group updated",
        description: "The group has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating group",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for deleting a group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (groupId: string) => deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: "Group deleted",
        description: "The group has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting group",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for fetching group members
export const useGroupMembers = (groupId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: () => getGroupMembers(groupId),
    onError: (error: any) => {
      toast({
        title: "Error fetching group members",
        description: error.message,
        variant: "destructive",
      });
    },
    enabled: !!groupId,
  });
};
