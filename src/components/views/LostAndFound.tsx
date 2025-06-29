import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, User, Clock, Camera, Zap, MapPin, Play, Eye } from 'lucide-react';
import { toast } from 'sonner';

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

interface SearchResult {
  personId: string;
  cameraId: string;
  location: string;
  timestamp: string;
  confidence: number;
  imageUrl: string;
  coordinates: { lat: number; lng: number };
}

export const LostAndFound = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'search' | 'cases'>('cases');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [lostPersonPhoto, setLostPersonPhoto] = useState<File | null>(null);
  const [crowdFootage, setCrowdFootage] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
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
        }
      ]
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

  const handleLostPersonPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLostPersonPhoto(file);
      toast.success('Lost person photo uploaded successfully');
    }
  };

  const handleCrowdFootageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCrowdFootage(file);
      toast.success('Crowd footage uploaded successfully');
    }
  };

  const handleFindPerson = async () => {
    if (!lostPersonPhoto || !crowdFootage) {
      toast.error('Please upload both lost person photo and crowd footage');
      return;
    }

    setIsSearching(true);
    toast.info('Searching for person in crowd footage...');

    // Simulate AI search process
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          personId: 'search-1',
          cameraId: 'CAM-12',
          location: 'Main Entrance Gate',
          timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString(),
          confidence: 92,
          imageUrl: '/placeholder.svg',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        {
          personId: 'search-2',
          cameraId: 'CAM-07',
          location: 'Food Court - Central Area',
          timestamp: new Date(Date.now() - 8 * 60000).toLocaleTimeString(),
          confidence: 88,
          imageUrl: '/placeholder.svg',
          coordinates: { lat: 40.7130, lng: -74.0058 }
        }
      ];

      setSearchResults(mockResults);
      setIsSearching(false);
      toast.success(`Found ${mockResults.length} potential matches!`);
    }, 3000);
  };

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
    toast.success('Missing person report submitted');
  };

  const handleRemoveReport = (id: string) => {
    setLostPersons(prev => prev.filter(person => person.id !== id));
    toast.success('Report removed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'found': return 'bg-green-500';
      case 'investigating': return 'bg-yellow-500';
      case 'missing': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 80) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI-Powered Lost & Found</h1>
          <p className="text-gray-600">Advanced facial recognition and matching system</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary bg-blue-50">
          <Zap className="w-4 h-4 mr-1" />
          AI Vision Active
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'cases', label: 'Active Cases', icon: Search },
          { id: 'report', label: 'Report Missing', icon: User },
          { id: 'search', label: 'Lost Person Finder', icon: Camera }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white text-primary shadow-sm' 
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
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleRemoveReport(person.id)}
                  >
                    Remove
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
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold text-gray-900">Lost Person Finder</h1>
                </div>
                <p className="text-gray-600 mb-8">Use AI to find a lost person in crowd footage.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Photo of Lost Person
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLostPersonPhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="lost-person-upload"
                      />
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                        <label htmlFor="lost-person-upload" className="cursor-pointer">
                          <span className="text-blue-700">
                            {lostPersonPhoto ? lostPersonPhoto.name : 'Choose File No file chosen'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Crowd Footage
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/*,image/*"
                        onChange={handleCrowdFootageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="crowd-footage-upload"
                      />
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                        <label htmlFor="crowd-footage-upload" className="cursor-pointer">
                          <span className="text-blue-700">
                            {crowdFootage ? crowdFootage.name : 'Choose File No file chosen'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleFindPerson}
                    disabled={isSearching || !lostPersonPhoto || !crowdFootage}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg"
                  >
                    {isSearching ? 'Searching...' : 'Find Person'}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Search Results</h3>
                    {searchResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getConfidenceColor(result.confidence)} text-white`}>
                              {result.confidence}% Match
                            </Badge>
                            <span className="font-medium">{result.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {result.timestamp}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <img 
                              src={result.imageUrl} 
                              alt="Detection"
                              className="w-full h-32 rounded object-cover"
                            />
                            <p className="text-xs text-gray-500 mt-1">Camera: {result.cameraId}</p>
                          </div>
                          
                          <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-red-500" />
                              <span className="font-medium">Location Details:</span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <p className="font-medium">{result.location}</p>
                              <p className="text-sm text-gray-600">
                                Coordinates: {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Last seen: {result.timestamp}
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Eye className="w-4 h-4 mr-1" />
                                View Live Feed
                              </Button>
                              <Button size="sm" variant="outline">
                                <Play className="w-4 h-4 mr-1" />
                                View Recording
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <MapPin className="w-4 h-4 mr-1" />
                                Navigate to Location
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
