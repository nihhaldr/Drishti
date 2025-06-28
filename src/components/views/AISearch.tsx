
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Search, MessageSquare, Clock, Users, Camera, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const searchHistory = [
  {
    query: "Show me crowd density at main stage",
    timestamp: "2 min ago",
    result: "Current density: 8,500/10,000 (85% capacity). Trend: Increasing. Risk level: Medium."
  },
  {
    query: "Any incidents reported in the last hour?",
    timestamp: "5 min ago", 
    result: "3 incidents reported: 1 medical emergency (active), 1 lost child (investigating), 1 resolved suspicious package."
  },
  {
    query: "What's the sentiment analysis for Gate 3?",
    timestamp: "8 min ago",
    result: "Social media sentiment: 72% positive, 18% neutral, 10% negative. Recent complaints about long entry lines."
  }
];

export const AISearch = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setQuery('');
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-400" />
          AI Assistant
        </h1>
        <p className="text-slate-400">Ask Drishti anything about the current situation</p>
      </div>

      {/* Search Interface */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything... (e.g., 'Show me crowd flow patterns' or 'Any safety concerns?')"
              className="pl-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 h-12 text-lg"
              disabled={isSearching}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="bg-blue-600 hover:bg-blue-700 px-8 h-12"
          >
            {isSearching ? 'Analyzing...' : 'Ask Drishti'}
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Users, text: "Current crowd analysis", color: "text-blue-400" },
            { icon: Camera, text: "Show all camera feeds", color: "text-green-400" },
            { icon: MapPin, text: "Incident locations", color: "text-red-400" },
            { icon: Clock, text: "Timeline of events", color: "text-yellow-400" },
            { text: "Weather impact", color: "text-purple-400" },
            { text: "Resource availability", color: "text-pink-400" }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => setQuery(item.text)}
              className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors"
            >
              {item.icon && <item.icon className={`w-5 h-5 ${item.color}`} />}
              <span className="text-slate-300">{item.text}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Search History */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Queries
        </h2>
        <div className="space-y-4">
          {searchHistory.map((item, index) => (
            <div key={index} className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-white">"{item.query}"</h3>
                <span className="text-xs text-slate-400">{item.timestamp}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{item.result}</p>
              <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm">
                Ask follow-up →
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Capabilities */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">What I Can Help With</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-white mb-2">Real-time Analysis</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Crowd density and flow patterns</li>
              <li>• Incident status and timelines</li>
              <li>• Resource allocation recommendations</li>
              <li>• Risk assessment and predictions</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">Data Insights</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Social media sentiment analysis</li>
              <li>• Historical trend comparisons</li>
              <li>• Weather and external factors</li>
              <li>• Performance metrics and KPIs</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
