
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, User, Clock, Camera, Zap } from 'lucide-react';

interface LostPerson {
  id: string;
  name: string;
  age: number;
  description: string;
  lastSeenLocation: string;
  lastSeenTime: string;
  photoUrl: string;
  reporterContact: string;
  status: 'missing' | 'found' | 'investigating';
  aiMatchConfidence?: number;
  potentialMatches?: Array<{
    cameraId: string;
    location: string;
    timestamp: string;
    confidence: number;
    imageUrl: string;
  }>;
}

export const LostAndFound = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'search' | 'cases'>('cases');
  const [searchQuery, setSearchQuery] = useState('');
  const [lostPersons, setLostPersons] = useState<LostPerson[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 8,
      description: 'Blonde hair, blue dress, carrying a teddy bear',
      lastSeenLocation: 'Near the carousel',
      lastSeenTime: '2:30 PM',
      photoUrl: '/placeholder.svg',
      reporterContact: 'Mom - (555) 123-4567',
      status: 'investigating',
      aiMatchConfidence: 87,
      potentialMatches: [
        {
          cameraId: 'CAM-15',
          location: 'Food Court - North Entrance',
          timestamp: '2:45 PM',
          confidence: 87,
          imageUrl: '/placeholder.svg'
        },
        {
          cameraId: 'CAM-23',
          location: 'Main Stage Area',
          timestamp: '2:52 PM',
          confidence: 74,
          imageUrl: '/placeholder.svg'
        }
      ]
    },
    {
      id: '2',
      name: 'Michael Chen',
      age: 12,
      description: 'Black hair, red t-shirt, wearing glasses',
      lastSeenLocation: 'Games area',
      lastSeenTime: '1:15 PM',
      photoUrl: '/placeholder.svg',
      reporterContact: 'Dad - (555) 987-6543',
      status: 'found',
      aiMatchConfidence: 95
    }
  ]);

  const [newReport, setNewReport] = useState({
    name: '',
    age: '',
    description: '',
    lastSeenLocation: '',
    contact: '',
    photo: null as File | null
  });

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const report: LostPerson = {
      id: Date.now().toString(),
      name: newReport.name,
      age: parseInt(newReport.age),
      description: newReport.description,
      lastSeenLocation: newReport.lastSeenLocation,
      lastSeenTime: new Date().toLocaleTimeString(),
      photoUrl: '/placeholder.svg',
      reporterContact: newReport.contact,
      status: 'missing'
    };
    setLostPersons(prev => [report, ...prev]);
    setNewReport({ name: '', age: '', description: '', lastSeenLocation: '', contact: '', photo: null });
    setActiveTab('cases');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'found': return 'bg-green-500';
      case 'investigating': return 'bg-yellow-500';
      case 'missing': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI-Powered Lost & Found</h1>
          <p className="text-gray-600">Advanced facial recognition and matching system</p>
        </div>
        <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
          <Zap className="w-4 h-4 mr-1" />
          AI Vision Active
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'cases', label: 'Active Cases', icon: Search },
          { id: 'report', label: 'Report Missing', icon: User },
          { id: 'search', label: 'AI Search', icon: Camera }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Cases</h2>
            <div className="flex gap-2">
              <Badge className="bg-red-500 text-white">
                {lostPersons.filter(p => p.status === 'missing').length} Missing
              </Badge>
              <Badge className="bg-yellow-500 text-white">
                {lostPersons.filter(p => p.status === 'investigating').length} Investigating
              </Badge>
              <Badge className="bg-green-500 text-white">
                {lostPersons.filter(p => p.status === 'found').length} Found
              </Badge>
            </div>
          </div>

          {lostPersons.map(person => (
            <Card key={person.id} className="bg-white border-gray-200 p-6">
              <div className="flex gap-4">
                <img 
                  src={person.photoUrl} 
                  alt={person.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{person.name}</h3>
                    <Badge className={`${getStatusColor(person.status)} text-white`}>
                      {person.status.toUpperCase()}
                    </Badge>
                    {person.aiMatchConfidence && (
                      <Badge variant="outline">
                        {person.aiMatchConfidence}% AI Match
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Age: {person.age} years</div>
                    <div>Last seen: {person.lastSeenTime}</div>
                    <div>Location: {person.lastSeenLocation}</div>
                    <div>Contact: {person.reporterContact}</div>
                  </div>
                  <p className="text-gray-700 mb-3">{person.description}</p>
                  
                  {person.potentialMatches && (
                    <div className="bg-blue-50 p-4 rounded border">
                      <h4 className="font-medium mb-2">AI Potential Matches:</h4>
                      <div className="space-y-2">
                        {person.potentialMatches.map((match, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                            <div className="flex items-center gap-3">
                              <img src={match.imageUrl} alt="Match" className="w-12 h-12 rounded object-cover" />
                              <div>
                                <div className="font-medium">{match.location}</div>
                                <div className="text-sm text-gray-500">{match.timestamp}</div>
                              </div>
                            </div>
                            <Badge className={match.confidence > 80 ? 'bg-green-500' : 'bg-yellow-500'} variant="outline">
                              {match.confidence}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    Contact Reporter
                  </Button>
                  {person.status === 'investigating' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Mark Found
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'report' && (
        <Card className="bg-white border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Report Missing Person</h2>
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input 
                  value={newReport.name}
                  onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <Input 
                  type="number"
                  value={newReport.age}
                  onChange={(e) => setNewReport(prev => ({ ...prev, age: e.target.value }))}
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                value={newReport.description}
                onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Physical appearance, clothing, distinctive features..."
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Seen Location</label>
              <Input 
                value={newReport.lastSeenLocation}
                onChange={(e) => setNewReport(prev => ({ ...prev, lastSeenLocation: e.target.value }))}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Contact Information</label>
              <Input 
                value={newReport.contact}
                onChange={(e) => setNewReport(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="Phone number or radio call sign"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upload Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Click to upload or drag and drop</p>
                <input type="file" accept="image/*" className="hidden" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
              Submit Missing Person Report
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'search' && (
        <Card className="bg-white border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">AI-Powered Search</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload Photo to Search</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 mb-2">Upload a photo to search across all camera feeds</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded border">
              <h3 className="font-medium text-blue-900 mb-2">How AI Search Works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Facial recognition across 127 active cameras</li>
                <li>• Real-time processing with 98% accuracy</li>
                <li>• Historical footage analysis (last 24 hours)</li>
                <li>• Confidence scoring for each match</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
