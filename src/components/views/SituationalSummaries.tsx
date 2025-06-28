
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  insights?: string[];
  recommendations?: string[];
}

export const SituationalSummaries = () => {
  const [query, setQuery] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(query),
        timestamp: new Date().toLocaleTimeString(),
        insights: generateInsights(query),
        recommendations: generateRecommendations(query)
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);

    setQuery('');
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

  const quickQueries = [
    'What is the current crowd density?',
    'Any active incidents?',
    'Show me safety status',
    'Weather impact analysis'
  ];

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Situational Summaries</h1>
          <p className="text-gray-600">Natural language queries powered by Gemini AI</p>
        </div>
        <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">
          <Sparkles className="w-4 h-4 mr-1" />
          Gemini AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2 bg-white border-gray-200 p-6">
          <div className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="mb-2">{message.content}</p>
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Clock className="w-3 h-3" />
                      {message.timestamp}
                    </div>
                    
                    {message.insights && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border">
                        <h5 className="font-medium text-gray-900 mb-1">Key Insights:</h5>
                        <ul className="text-sm space-y-1">
                          {message.insights.map((insight, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-700">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {message.recommendations && (
                      <div className="mt-2 p-3 bg-green-50 rounded border">
                        <h5 className="font-medium text-gray-900 mb-1">Recommendations:</h5>
                        <ul className="text-sm space-y-1">
                          {message.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-700">
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
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me about crowd conditions, incidents, or safety status..."
                className="flex-1"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Quick Actions & Status */}
        <div className="space-y-4">
          <Card className="bg-white border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Queries</h3>
            <div className="space-y-2">
              {quickQueries.map((queryText, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(queryText)}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  {queryText}
                </button>
              ))}
            </div>
          </Card>

          <Card className="bg-white border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Current Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Status</span>
                <Badge className="bg-green-500 text-white">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Alerts</span>
                <Badge className="bg-yellow-500 text-white">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <Badge variant="outline">Less than 2s</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
