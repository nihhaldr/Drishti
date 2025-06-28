
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mic, Camera, MapPin, Clock, Users, AlertTriangle } from 'lucide-react';

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

export const AISearch = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate AI search
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      setIsSearching(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 md:p-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">AI-Powered Search</h1>
          <p className="text-sm md:text-base text-muted-foreground">Ask Drishti AI anything about your event</p>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Search Interface */}
        <Card className="p-4 md:p-6 bg-card border-border mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything... (e.g., 'Show me crowd density at Gate 3')"
                className="pl-12 text-base h-12"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !query.trim()}
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
          <Card className="p-4 md:p-6 bg-card border-border mb-6">
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

        {/* No Results */}
        {hasSearched && searchResults.length === 0 && !isSearching && (
          <Card className="p-8 md:p-12 bg-card border-border text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">Try rephrasing your question or use different keywords</p>
          </Card>
        )}

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
