
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Settings, 
  Users, 
  UserPlus, 
  XCircle,
  MoreVertical,
  Trash,
  Edit,
  Play
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useGroup, useDeleteGroup } from '@/hooks/useGroups';
import { useCycles, useActivateNextCycle } from '@/hooks/useCycles';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/hooks/useRealtime';

import PaymentHistory from '@/components/groups/PaymentHistory';
import MembersList from '@/components/groups/MembersList';
import CycleManagement from '@/components/groups/CycleManagement';
import GroupSettings from '@/components/groups/GroupSettings';
import GroupInvite from '@/components/groups/GroupInvite';
import { useToast } from '@/hooks/use-toast';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const { data: groupData, isLoading, isError } = useGroup(id || '');
  const { data: cycles = [] } = useCycles(id || '');
  const { mutate: activateNextCycle } = useActivateNextCycle();
  const { mutate: deleteGroup } = useDeleteGroup();
  
  // Set up realtime subscriptions
  useRealtime([
    { table: 'groups', event: 'UPDATE', filter: `id=eq.${id}` },
    { table: 'group_members', event: '*', filter: `group_id=eq.${id}` },
    { table: 'cycles', event: '*', filter: `group_id=eq.${id}` },
    { table: 'payments', event: '*' },
  ]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isError || !groupData) {
    return <div className="text-center my-8">Error loading group details</div>;
  }

  const { group, members } = groupData;
  
  const isAdmin = members.some(member => 
    member.user_id === user?.id && member.is_admin
  );

  const activeCycle = cycles.find(c => c.status === 'active');
  const upcomingCycles = cycles.filter(c => c.status === 'upcoming');
  const completedCycles = cycles.filter(c => c.status === 'completed');
  
  const handleActivateNextCycle = () => {
    activateNextCycle(id || '', {
      onSuccess: () => {
        toast({
          title: "Next cycle activated",
          description: "The next cycle has been activated successfully.",
        });
      }
    });
  };

  const handleDeleteGroup = () => {
    deleteGroup(id || '', {
      onSuccess: () => {
        toast({
          title: "Group deleted",
          description: "The group has been deleted successfully."
        });
        navigate('/groups');
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            {group.is_public && (
              <Badge variant="outline" className="ml-2">
                Public
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {group.description || "No description provided"}
          </p>
        </div>
        
        {isAdmin && (
          <div className="mt-4 md:mt-0 flex gap-2">
            <GroupInvite groupId={id || ''} groupName={group.name} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Group
                </DropdownMenuItem>
                {activeCycle && upcomingCycles.length > 0 && (
                  <DropdownMenuItem onClick={handleActivateNextCycle}>
                    <Play className="h-4 w-4 mr-2" />
                    Activate Next Cycle
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={() => setShowConfirmDelete(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 md:w-auto w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="cycles">Cycles</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Group Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Cycle Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.current_cycle} of {group.total_cycles} cycles completed
                    </p>
                    <div className="w-full bg-secondary h-2 rounded-full mt-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(group.current_cycle / group.total_cycles) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-medium">Contribution Details</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">${group.contribution_amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <p className="font-medium">{group.contribution_frequency}</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-medium">Membership</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Members</p>
                        <p className="font-medium">{members.length} of {group.max_members}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Join Requests</p>
                        <p className="font-medium">
                          {group.allow_join_requests ? 'Allowed' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {members.length < group.max_members && (
                    <div className="mt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="#" onClick={() => setActiveTab('members')}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite Members
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Cycle Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeCycle ? (
                    <div>
                      <h3 className="font-medium">
                        Active Cycle: #{activeCycle.cycle_number}
                      </h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Started</p>
                          <p className="font-medium">
                            {new Date(activeCycle.started_at || activeCycle.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Recipient</p>
                          <p className="font-medium">
                            {activeCycle.recipient?.name || "Not assigned"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-medium">
                            {new Date(activeCycle.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Date</p>
                          <p className="font-medium">
                            {new Date(activeCycle.payment_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => setActiveTab('cycles')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View Cycle Details
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32">
                      <XCircle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No active cycle</p>
                      {isAdmin && upcomingCycles.length > 0 && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={handleActivateNextCycle}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Activate Next Cycle
                        </Button>
                      )}
                    </div>
                  )}
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Upcoming</h3>
                      <p className="text-3xl font-bold mt-1">{upcomingCycles.length}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Completed</h3>
                      <p className="text-3xl font-bold mt-1">{completedCycles.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="members">
            <MembersList groupId={group.id} />
          </TabsContent>
          
          <TabsContent value="cycles">
            <CycleManagement groupId={group.id} />
          </TabsContent>
          
          <TabsContent value="payments">
            <PaymentHistory groupId={group.id} />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="settings">
              <GroupSettings groupId={group.id} />
            </TabsContent>
          )}
        </div>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              group and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGroup}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupDetail;
