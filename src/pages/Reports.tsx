
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FadeIn from "@/components/ui/FadeIn";
import { 
  FileText, 
  BarChart, 
  PieChart, 
  TrendingUp,
  Calendar as CalendarIcon, 
  Download, 
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import CalendarView from "@/components/reports/CalendarView";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const Reports = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contributionData, setContributionData] = useState<any[]>([]);
  const [cycleData, setCycleData] = useState<any[]>([]);
  const [paymentDistribution, setPaymentDistribution] = useState<any[]>([]);
  
  useEffect(() => {
    // Check if user is logged in, redirect to onboarding if not
    const userData = localStorage.getItem("user");
    if (!userData) {
      window.location.href = "/onboarding";
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Load data for reports
    setTimeout(() => {
      loadReportData();
      setLoading(false);
    }, 800);
  }, []);
  
  const loadReportData = () => {
    // Fetch groups data from localStorage
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    
    // Generate contribution history data - monthly totals for the last 6 months
    const contribData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    
    // Generate sample data for now
    for (let i = 0; i < months.length; i++) {
      contribData.push({
        month: months[i],
        amount: Math.floor(Math.random() * 300) + 100
      });
    }
    setContributionData(contribData);
    
    // Generate cycle completion data
    const cycleCompletion = [
      { name: "Completed", value: 3 },
      { name: "In Progress", value: 2 },
      { name: "Upcoming", value: 5 }
    ];
    setCycleData(cycleCompletion);
    
    // Generate payment distribution data
    const paymentDist = [
      { name: "On Time", value: 12 },
      { name: "Late", value: 3 },
      { name: "Missed", value: 1 }
    ];
    setPaymentDistribution(paymentDist);
  };
  
  // Colors for pie charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/3 bg-muted/30 rounded"></div>
          <div className="h-80 bg-muted/30 rounded-xl"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Reports</h1>
          <p className="text-muted-foreground">
            View and download reports about your savings groups
          </p>
        </div>

        <Tabs defaultValue="analytics" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart size={18} />
                    Contribution History
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Your monthly contribution totals</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        amount: {
                          theme: {
                            light: "#0284c7",
                            dark: "#0ea5e9",
                          },
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={contributionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]} className="fill-[--color-amount]" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={18} />
                    Savings Projection
                    <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Beta</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        projected: {
                          theme: {
                            light: "#059669",
                            dark: "#10b981",
                          },
                        },
                        actual: {
                          theme: {
                            light: "#0284c7",
                            dark: "#0ea5e9",
                          },
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "Jan", actual: 100, projected: 100 },
                            { month: "Feb", actual: 220, projected: 200 },
                            { month: "Mar", actual: 320, projected: 300 },
                            { month: "Apr", actual: 450, projected: 400 },
                            { month: "May", actual: 580, projected: 500 },
                            { month: "Jun", actual: 650, projected: 600 },
                            { month: "Jul", projected: 700 },
                            { month: "Aug", projected: 800 },
                            { month: "Sep", projected: 900 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip content={<ChartTooltipContent />} />
                          <Line 
                            type="monotone" 
                            dataKey="actual" 
                            name="Actual Savings" 
                            stroke="var(--color-actual)" 
                            strokeWidth={2} 
                            dot={{ r: 4 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="projected" 
                            name="Projected Savings" 
                            stroke="var(--color-projected)" 
                            strokeWidth={2} 
                            strokeDasharray="5 5"
                            dot={{ r: 4 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart size={18} />
                    Cycle Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        Completed: {
                          theme: {
                            light: "#059669",
                            dark: "#10b981",
                          },
                        },
                        "In Progress": {
                          theme: {
                            light: "#0284c7",
                            dark: "#0ea5e9",
                          },
                        },
                        Upcoming: {
                          theme: {
                            light: "#d97706",
                            dark: "#f59e0b",
                          },
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={cycleData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell key="cell-0" fill="var(--color-Completed)" />
                            <Cell key="cell-1" fill="var(--color-In Progress)" />
                            <Cell key="cell-2" fill="var(--color-Upcoming)" />
                          </Pie>
                          <RechartsTooltip content={<ChartTooltipContent />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart size={18} />
                    Payment Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        "On Time": {
                          theme: {
                            light: "#059669",
                            dark: "#10b981",
                          },
                        },
                        Late: {
                          theme: {
                            light: "#d97706",
                            dark: "#f59e0b",
                          },
                        },
                        Missed: {
                          theme: {
                            light: "#dc2626",
                            dark: "#ef4444",
                          },
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={paymentDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell key="cell-0" fill="var(--color-On Time)" />
                            <Cell key="cell-1" fill="var(--color-Late)" />
                            <Cell key="cell-2" fill="var(--color-Missed)" />
                          </Pie>
                          <RechartsTooltip content={<ChartTooltipContent />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon size={18} />
                  Payment Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarView />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={18} />
                  Export Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <div className="mx-auto bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Download className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Export Options Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    We're working on adding various export formats for your reports including PDF, CSV, and Excel.
                  </p>
                  <Button variant="outline" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </AppShell>
  );
};

export default Reports;
