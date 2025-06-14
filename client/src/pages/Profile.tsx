import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Settings, Shield, Bell, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePortfolio, useHoldings } from "@/hooks/usePortfolio";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { data: portfolio } = usePortfolio(1);
  const { data: holdings = [] } = useHoldings(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: ""
  });

  // Fetch user profile data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/user", 1],
    queryFn: async () => {
      const response = await fetch("/api/user/1");
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: typeof formData) => {
      const response = await fetch("/api/user/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", 1] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update form data when user data loads
  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        location: userData.location || ""
      });
    }
  }, [userData]);

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const profileStats = [
    {
      label: "Portfolio Value",
      value: `$${parseFloat(portfolio?.totalValue || "0").toLocaleString()}`,
      change: "+$2,845.32",
      changeType: "positive" as const
    },
    {
      label: "Total Holdings",
      value: holdings.length.toString(),
      change: "5 stocks",
      changeType: "neutral" as const
    },
    {
      label: "Performance",
      value: "+17.4%",
      change: "All time",
      changeType: "positive" as const
    },
    {
      label: "Risk Score",
      value: portfolio?.riskScore || "0.0",
      change: "Moderate",
      changeType: "neutral" as const
    }
  ];

  const getGradientClass = (symbol: string) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600", 
      "from-red-500 to-pink-600",
      "from-yellow-500 to-orange-600",
      "from-purple-500 to-indigo-600"
    ];
    const index = symbol.length % gradients.length;
    return gradients[index];
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{userData?.fullName || "Portfolio User"}</h1>
            <p className="text-gray-400 mb-2">{userData?.email || "Email not set"}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {userData?.location || "Location not set"}
              </span>
            </div>
          </div>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {profileStats.map((stat, index) => (
            <Card key={index} className="bg-dark-secondary border-gray-700">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold font-mono mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-400' : 
                    stat.changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <Card className="bg-dark-secondary border-gray-700 mb-8">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="bg-dark-tertiary border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-dark-tertiary border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-dark-tertiary border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="bg-dark-tertiary border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-dark-secondary">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holdings">My Holdings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Profile */}
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Investment Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Experience Level</span>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      Intermediate
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Risk Tolerance</span>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      Moderate
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Investment Goals</span>
                    <span className="text-white">Long-term Growth</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Portfolio Style</span>
                    <span className="text-white">Growth Focused</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-dark-tertiary rounded-lg">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-xs">+</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Added NVDA position</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-dark-tertiary rounded-lg">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 text-xs">↑</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Portfolio gained +2.3%</p>
                      <p className="text-xs text-gray-400">Today</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-dark-tertiary rounded-lg">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 text-xs">$</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dividend received</p>
                      <p className="text-xs text-gray-400">Yesterday</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-6">
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
                <p className="text-gray-400">Your complete investment portfolio</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {holdings.map((holding) => {
                    const gainLoss = parseFloat(holding.gainLoss);
                    const isPositive = gainLoss >= 0;
                    
                    return (
                      <div key={holding.id} className="p-4 bg-dark-tertiary rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${getGradientClass(holding.symbol)} rounded-full flex items-center justify-center text-sm font-bold`}>
                            {holding.symbol.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{holding.symbol}</h3>
                            <p className="text-sm text-gray-400">{holding.name}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Shares:</span>
                            <span className="font-mono">{parseFloat(holding.shares).toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Current Price:</span>
                            <span className="font-mono">${parseFloat(holding.currentPrice).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Value:</span>
                            <span className="font-mono">${parseFloat(holding.totalValue).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">P&L:</span>
                            <span className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {isPositive ? '+' : ''}${gainLoss.toFixed(2)} ({parseFloat(holding.gainLossPercent).toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {holdings.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-400">
                      <p>No holdings found. Start building your portfolio!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </main>

      <Footer />
    </div>
  );
}