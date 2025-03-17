
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Star, CheckCircle, Target, TrendingUp, Clock, Medal, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FadeIn from "@/components/ui/FadeIn";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  date?: string;
}

interface AchievementBadgesProps {
  userId: string;
}

const AchievementBadges = ({ userId }: AchievementBadgesProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load user data and calculate achievements
    setTimeout(() => {
      calculateAchievements(userId);
      setLoading(false);
    }, 500);
  }, [userId]);
  
  const calculateAchievements = (userId: string) => {
    // In a real app, these would be calculated based on actual user data
    // For now, we'll create some sample achievements
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    
    // Count how many groups the user has joined
    const userGroups = groups.filter((group: any) => 
      group.membersList?.some((member: any) => member.id === userId)
    );
    
    // Count completed cycles and on-time payments
    let completedCycles = 0;
    let totalPayments = 0;
    let onTimePayments = 0;
    
    userGroups.forEach((group: any) => {
      if (group.cycles) {
        // Count completed cycles
        completedCycles += group.cycles.filter((cycle: any) => cycle.status === "completed").length;
        
        // Count on-time payments
        group.cycles.forEach((cycle: any) => {
          if (cycle.payments) {
            const userPayments = cycle.payments.filter((p: any) => p.memberId === userId);
            totalPayments += userPayments.length;
            onTimePayments += userPayments.filter((p: any) => p.status === "paid" && p.onTime).length;
          }
        });
      }
    });
    
    // Define achievements
    const achievementsList: Achievement[] = [
      {
        id: "first-group",
        title: "Group Founder",
        description: "Created your first savings group",
        icon: <Trophy className="h-6 w-6" />,
        color: "text-amber-500",
        unlocked: userGroups.some((g: any) => g.createdBy === userId),
        date: userGroups.find((g: any) => g.createdBy === userId)?.createdAt
      },
      {
        id: "on-time",
        title: "Reliable Contributor",
        description: "Make 5 on-time payments",
        icon: <Clock className="h-6 w-6" />,
        color: "text-blue-500",
        unlocked: onTimePayments >= 5,
        progress: Math.min(onTimePayments, 5),
        maxProgress: 5
      },
      {
        id: "completed-cycle",
        title: "Full Circle",
        description: "Complete a full savings cycle",
        icon: <CheckCircle className="h-6 w-6" />,
        color: "text-green-500",
        unlocked: completedCycles > 0,
        date: completedCycles > 0 ? new Date().toISOString() : undefined
      },
      {
        id: "multiple-groups",
        title: "Community Builder",
        description: "Join 3 different savings groups",
        icon: <Users className="h-6 w-6" />,
        color: "text-purple-500",
        unlocked: userGroups.length >= 3,
        progress: Math.min(userGroups.length, 3),
        maxProgress: 3
      },
      {
        id: "perfect-attendance",
        title: "Perfect Record",
        description: "100% on-time payments in a group",
        icon: <Award className="h-6 w-6" />,
        color: "text-amber-500",
        unlocked: totalPayments > 0 && onTimePayments === totalPayments,
      },
      {
        id: "savings-goal",
        title: "Goal Achiever",
        description: "Reach your first savings goal",
        icon: <Target className="h-6 w-6" />,
        color: "text-red-500",
        unlocked: false,
        progress: 60,
        maxProgress: 100
      }
    ];
    
    setAchievements(achievementsList);
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-muted/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  
  return (
    <FadeIn>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Medal className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Achievements</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Earn badges by participating in savings groups and making on-time contributions
        </p>
      </div>
      
      {unlockedAchievements.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {unlockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`rounded-full p-3 bg-opacity-20 ${achievement.color.replace('text-', 'bg-')}`}>
                      <div className={achievement.color}>
                        {achievement.icon}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Unlocked</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  
                  {achievement.date && (
                    <p className="text-xs text-muted-foreground">
                      Earned on {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {lockedAchievements.length > 0 && (
            <>
              <h3 className="font-medium text-muted-foreground mb-4">In Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => (
                  <Card key={achievement.id} className="opacity-70 hover:opacity-100 transition-opacity">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="rounded-full p-3 bg-muted">
                          <div className="text-muted-foreground">
                            {achievement.icon}
                          </div>
                        </div>
                        <Badge variant="outline">Locked</Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      
                      {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <div className="mx-auto bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Achievements Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start participating in savings groups and making contributions to earn badges and achievements.
            </p>
          </CardContent>
        </Card>
      )}
    </FadeIn>
  );
};

export default AchievementBadges;
