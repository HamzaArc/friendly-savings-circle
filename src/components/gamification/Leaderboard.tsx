
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FadeIn from "@/components/ui/FadeIn";

interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
  previousRank: number;
  onTimePercentage: number;
  completedCycles: number;
  avatar?: string;
}

interface LeaderboardProps {
  groupId?: string; // If provided, show leaderboard for specific group
}

const Leaderboard = ({ groupId }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUserId(JSON.parse(userData).id || "1");
    }
    
    // In a real app, this would fetch leaderboard data from an API
    setTimeout(() => {
      generateLeaderboard(groupId);
      setLoading(false);
    }, 500);
  }, [groupId]);
  
  const generateLeaderboard = (groupId?: string) => {
    // For demo purposes, create a sample leaderboard
    const leaderboardData: LeaderboardEntry[] = [
      {
        userId: "1",
        name: "Alice Johnson",
        score: 95,
        rank: 1,
        previousRank: 1,
        onTimePercentage: 100,
        completedCycles: 3
      },
      {
        userId: "2",
        name: "Bob Smith",
        score: 87,
        rank: 2,
        previousRank: 3,
        onTimePercentage: 92,
        completedCycles: 2
      },
      {
        userId: "3",
        name: "Charlie Davis",
        score: 82,
        rank: 3,
        previousRank: 2,
        onTimePercentage: 89,
        completedCycles: 2
      },
      {
        userId: "4",
        name: "Dana Wilson",
        score: 78,
        rank: 4,
        previousRank: 4,
        onTimePercentage: 85,
        completedCycles: 1
      },
      {
        userId: "5",
        name: "Eva Martinez",
        score: 75,
        rank: 5,
        previousRank: 6,
        onTimePercentage: 80,
        completedCycles: 2
      }
    ];
    
    // Find current user data in localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      
      // Check if user is already in the leaderboard
      const userIndex = leaderboardData.findIndex(entry => entry.userId === user.id);
      
      // If not, add them
      if (userIndex === -1 && user.id !== "1" && user.id !== "2") {
        leaderboardData.push({
          userId: user.id,
          name: user.name,
          score: 65,
          rank: 6,
          previousRank: 7,
          onTimePercentage: 75,
          completedCycles: 1
        });
      }
    }
    
    // Sort by score
    leaderboardData.sort((a, b) => b.score - a.score);
    
    // Update ranks
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    setLeaderboard(leaderboardData);
  };
  
  const getRankChangeIcon = (entry: LeaderboardEntry) => {
    if (entry.previousRank < entry.rank) {
      return <ChevronDown className="h-4 w-4 text-red-500" />;
    } else if (entry.previousRank > entry.rank) {
      return <ChevronUp className="h-4 w-4 text-green-500" />;
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };
  
  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-amber-100 text-amber-800",
    ];
    
    const index = parseInt(userId) % colors.length;
    return colors[index] || colors[0];
  };
  
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-5 w-5 text-amber-500" />;
    } else if (rank === 2) {
      return <Medal className="h-5 w-5 text-slate-400" />;
    } else if (rank === 3) {
      return <Medal className="h-5 w-5 text-amber-700" />;
    } else {
      return <span className="text-muted-foreground font-medium">{rank}</span>;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  
  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Savings Leaderboard
          </CardTitle>
          <CardDescription>
            {groupId 
              ? "Top savers in this group" 
              : "Top savers across all groups"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div 
                key={entry.userId} 
                className={`p-3 rounded-lg flex items-center justify-between ${
                  entry.userId === currentUserId ? "bg-primary/10 border border-primary/20" : "border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8">
                    {getRankBadge(entry.rank)}
                  </div>
                  
                  <Avatar className={getAvatarColor(entry.userId)}>
                    <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium flex items-center gap-1">
                      {entry.name}
                      {entry.userId === currentUserId && (
                        <Badge variant="outline" className="ml-1 text-xs">You</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.completedCycles} cycle{entry.completedCycles !== 1 ? 's' : ''} completed
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{entry.score}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                  
                  <div className="flex items-center">
                    {getRankChangeIcon(entry)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
};

export default Leaderboard;
