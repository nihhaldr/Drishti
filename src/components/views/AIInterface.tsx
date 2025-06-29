
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Mic, Camera, MapPin, Clock, Users, AlertTriangle, Send, Sparkles } from 'lucide-react';

const searchSuggestions = [
  "Show me crowd density at Gate 3",
  "Find lost person alerts in last hour",
  "What's the status of medical emergencies?",
  "Display all active incidents",
  "Show camera feeds with alerts",
  "Where is the highest crowd concentration?"
];

const mockSearchResults = [
  {
    type: 'incident',
    title: 'Medical Emergency at Gate 3',
    description: 'Active incident reported 15 minutes ago',
    location: 'Gate 3',
    timestamp: '15 min ago',
    priority: 'critical'
  },
  {
    type: 'crowd',
    title: 'High Crowd Density - Main Stage',
    description: '85% capacity reached, monitoring required',
    location: 'Main Stage',
    timestamp: '2 min ago',
    priority: 'high'
  },
  {
    type: 'camera',
    title: 'Camera Feed - Parking Lot A',
    description: 'Motion detected in restricted area',
    location: 'Parking Lot A',
    timestamp: '8 min ago',
    priority: 'medium'
  }
];

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  insights?: string[];
  recommendations?: string[];
}

export const AIInterface = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I am your AI Situational Analysis Assistant powered by Gemini. Ask me anything about the current event status, crowd conditions, or safety concerns.',
      timestamp: new Date().toLocaleTimeString(),
      insights: ['3 active incidents requiring attention', '15% above normal crowd density', 'Weather conditions: Favorable'],
      recommendations: ['Monitor Gate 3 closely', 'Consider opening auxiliary exits']
    }
  ]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate AI search
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      setIsSearching(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setActiveTab('search');
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatQuery,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(chatQuery),
        timestamp: new Date().toLocaleTimeString(),
        insights: generateInsights(chatQuery),
        recommendations: generateRecommendations(chatQuery)
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);

    setChatQuery('');
  };

  const generateAIResponse = (query: string) => {
    if (query.toLowerCase().includes('crowd')) {
      return 'Current crowd analysis shows 47,832 attendees with concentration at Main Stage (78%) and Food Court (65%). Peak capacity expected in 45 minutes based on historical patterns.';
    }
    if (query.toLowerCase().includes('incident')) {
      return 'There are currently 3 active incidents: 1 medical emergency near Gate 2, 1 lost person report, and 1 minor security concern at the VIP area. All are being addressed by respective teams.';
    }
    return 'Based on current data analysis, the event is proceeding smoothly with normal crowd flow patterns. All safety systems are operational and monitoring continues.';
  };

  const generateInsights = (query: string) => {
    if (query.toLowerCase().includes('crowd')) {
      return ['Crowd density 15% above baseline', 'Main bottleneck at food vendors', 'Exit routes operating at 60% capacity'];
    }
    return ['All systems operational', 'Response times within normal range', 'Weather conditions stable'];
  };

  const generateRecommendations = (query: string) => {
    if (query.toLowerCase().includes('crowd')) {
      return ['Open secondary food service areas', 'Deploy crowd control at main stage', 'Monitor exit flow rates'];
    }
    return ['Continue standard monitoring', 'Maintain current resource allocation'];
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'crowd':
        return <Users className="w-5 h-5 text-yellow-500" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-blue-500" />;
      default:
        return <Search className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-green-500 text-white'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const quickQueries = [
    'What is the current crowd density?',
    'Any active incidents?',
    'Show me safety status',
    'Weather impact analysis'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">Drishti AI Assistant</h1>
            <p className="text-sm md:text-base text-muted-foreground">AI-powered search and situational analysis</p>
          </div>
          <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">
            <Sparkles className="w-4 h-4 mr-1" />
            Gemini AI
          </Badge>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              AI Search
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Summaries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Interface */}
            <Card className="p-4 md:p-6 bg-card border-border">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask anything... (e.g., 'Show me crowd density at Gate 3')"
                    className="pl-12 text-base h-12"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12 border-border">
                    <Mic className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Search Suggestions */}
            {!hasSearched && (
              <Card className="p-4 md:p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Try asking:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto p-3 border-border hover:bg-accent"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Loading State */}
            {isSearching && (
              <Card className="p-8 md:p-12 bg-card border-border text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-foreground">Drishti AI is analyzing your request...</p>
                <p className="text-sm text-muted-foreground mt-2">Searching through cameras, incidents, and crowd data</p>
              </Card>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && !isSearching && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Search Results</h3>
                  <Badge className="bg-primary text-primary-foreground">
                    {searchResults.length} results found
                  </Badge>
                </div>
                
                {searchResults.map((result, index) => (
                  <Card key={index} className="p-4 md:p-6 bg-card border-border hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start gap-4">
                      {getResultIcon(result.type)}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h4 className="text-base md:text-lg font-semibold text-foreground">{result.title}</h4>
                          <Badge className={getPriorityBadge(result.priority)}>
                            {result.priority}
                          </Badge>
                        </div>
                        <p className="text-sm md:text-base text-muted-foreground mb-3">{result.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{result.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{result.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <Card className="lg:col-span-2 bg-card border-border p-6">
                <div className="h-[500px] flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-foreground'
                        }`}>
                          <p className="mb-2">{message.content}</p>
                          <div className="flex items-center gap-2 text-xs opacity-70">
                            <Clock className="w-3 h-3" />
                            {message.timestamp}
                          </div>
                          
                          {message.insights && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border">
                              <h5 className="font-medium text-foreground mb-1">Key Insights:</h5>
                              <ul className="text-sm space-y-1">
                                {message.insights.map((insight, index) => (
                                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    {insight}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {message.recommendations && (
                            <div className="mt-2 p-3 bg-green-50 rounded border">
                              <h5 className="font-medium text-foreground mb-1">Recommendations:</h5>
                              <ul className="text-sm space-y-1">
                                {message.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      placeholder="Ask me about crowd conditions, incidents, or safety status..."
                      className="flex-1"
                    />
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </Card>

              {/* Quick Actions & Status */}
              <div className="space-y-4">
                <Card className="bg-card border-border p-4">
                  <h3 className="font-semibold text-foreground mb-3">Quick Queries</h3>
                  <div className="space-y-2">
                    {quickQueries.map((queryText, index) => (
                      <button
                        key={index}
                        onClick={() => setChatQuery(queryText)}
                        className="w-full text-left p-2 text-sm bg-muted hover:bg-accent rounded border transition-colors"
                      >
                        {queryText}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="bg-card border-border p-4">
                  <h3 className="font-semibold text-foreground mb-3">Current Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">System Status</span>
                      <Badge className="bg-green-500 text-white">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Alerts</span>
                      <Badge className="bg-yellow-500 text-white">3</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Response Time</span>
                      <Badge variant="outline">Less than 2s</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Capabilities */}
        <Card className="p-4 md:p-6 bg-card border-border mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">What Drishti AI can help with:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <Camera className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-foreground">Camera Analysis</h4>
              <p className="text-xs text-muted-foreground mt-1">Real-time video monitoring</p>
            </div>
            <div className="text-center p-4">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-foreground">Crowd Insights</h4>
              <p className="text-xs text-muted-foreground mt-1">Density and flow analysis</p>
            </div>
            <div className="text-center p-4">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h4 className="font-medium text-foreground">Incident Tracking</h4>
              <p className="text-xs text-muted-foreground mt-1">Security event management</p>
            </div>
            <div className="text-center p-4">
              <MapPin className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium text-foreground">Location Data</h4>
              <p className="text-xs text-muted-foreground mt-1">Venue-wide monitoring</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
