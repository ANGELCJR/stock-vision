import { useState } from "react";
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

export default function Profile() {
  const { data: portfolio } = usePortfolio(1);
  const { data: holdings = [] } = useHoldings(1);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alex Morgan",
    email: "alex.morgan@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "March 2023",
    investmentExperience: "Intermediate",
    riskTolerance: "Moderate",
    investmentGoals: "Long-term Growth"
  });

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
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
            <p className="text-gray-400 mb-2">{profile.email}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {profile.joinDate}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {profile.location}
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-dark-secondary">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holdings">My Holdings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
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
                      {profile.investmentExperience}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Risk Tolerance</span>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      {profile.riskTolerance}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Investment Goals</span>
                    <span className="text-white">{profile.investmentGoals}</span>
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
                      <span className="text-purple-400 text-xs">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">AI insights generated</p>
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

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        disabled={!isEditing}
                        className="bg-dark-tertiary border-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        disabled={!isEditing}
                        className="bg-dark-tertiary border-gray-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        disabled={!isEditing}
                        className="bg-dark-tertiary border-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        disabled={!isEditing}
                        className="bg-dark-tertiary border-gray-600"
                      />
                    </div>
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex space-x-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications */}
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Portfolio alerts</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Price alerts</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>News updates</span>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI insights</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Enable Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Download Account Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-400 border-red-400 hover:bg-red-500/20">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}