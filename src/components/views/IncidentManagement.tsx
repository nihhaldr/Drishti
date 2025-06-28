
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Clock, MapPin, User, Phone, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const incidents = [
  {
    id: 'INC-001',
    title: 'Medical Emergency',
    status: 'active',
    priority: 'high',
    location: 'Main Stage - Section A',
    reporter: 'Security Team Alpha',
    time: '14:32',
    description: 'Patron collapsed, medical assistance required',
    responders: ['Medic Unit 3', 'Security Team Alpha']
  },
  {
    id: 'INC-002', 
    title: 'Lost Child',
    status: 'investigating',
    priority: 'medium',
    location: 'Food Court',
    reporter: 'Parent - Sarah Johnson',
    time: '14:28',
    description: '8-year-old boy, wearing blue shirt, last seen 30 mins ago',
    responders: ['Security Team Beta']
  },
  {
    id: 'INC-003',
    title: 'Suspicious Package',
    status: 'resolved',
    priority: 'high',
    location: 'Gate 2',
    reporter: 'AI Detection System',
    time: '14:15',
    description: 'Unattended bag detected, owner located and verified',
    responders: ['Security Team Gamma', 'K-9 Unit']
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-red-600';
    case 'investigating': return 'bg-yellow-600';
    case 'resolved': return 'bg-green-600';
    default: return 'bg-slate-600';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
    default: return 'text-slate-400';
  }
};

export const IncidentManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Incident Management</h1>
          <p className="text-slate-400">Track and respond to security incidents</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          Report New Incident
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-slate-400 text-sm">Active</p>
              <p className="text-xl font-bold text-white">1</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-slate-400 text-sm">Investigating</p>
              <p className="text-xl font-bold text-white">1</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Resolved Today</p>
              <p className="text-xl font-bold text-white">8</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Response Teams</p>
              <p className="text-xl font-bold text-white">6</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {incidents.map((incident) => (
          <Card key={incident.id} className="bg-slate-800 border-slate-700">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Badge className={`${getStatusColor(incident.status)} text-white`}>
                      {incident.status}
                    </Badge>
                    <div className={`text-sm font-medium ${getPriorityColor(incident.priority)}`}>
                      {incident.priority.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
                      <span className="text-slate-400 text-sm">#{incident.id}</span>
                    </div>
                    
                    <p className="text-slate-300 mb-3">{incident.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">{incident.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">{incident.reporter}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">{incident.time}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-slate-400 mb-1">Active Responders:</p>
                      <div className="flex flex-wrap gap-2">
                        {incident.responders.map((responder, index) => (
                          <Badge key={index} variant="outline" className="border-slate-600 text-slate-300">
                            {responder}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                    View Details
                  </Button>
                  {incident.status === 'active' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Update Status
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
