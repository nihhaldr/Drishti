
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Clock, User, MapPin, Plus, Search, Filter } from 'lucide-react';
import { incidentService, Incident, IncidentStatus, IncidentPriority, IncidentType } from '@/services/incidentService';
import { toast } from 'sonner';

const mockIncidents = [
  {
    id: '1',
    title: 'Medical Emergency - Gate 3',
    description: 'Person collapsed near entrance',
    status: 'active' as IncidentStatus,
    priority: 'critical' as IncidentPriority,
    incident_type: 'medical_emergency' as IncidentType,
    location_name: 'Gate 3',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Crowd Density Alert - Main Stage',
    description: 'Overcrowding detected in front sections',
    status: 'investigating' as IncidentStatus,
    priority: 'high' as IncidentPriority,
    incident_type: 'crowd_density' as IncidentType,
    location_name: 'Main Stage',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Lost Person - Child',
    description: '8-year-old missing near food court',
    status: 'active' as IncidentStatus,
    priority: 'high' as IncidentPriority,
    incident_type: 'lost_person' as IncidentType,
    location_name: 'Food Court',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const IncidentManagement = () => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    incident_type: 'general' as IncidentType,
    priority: 'medium' as IncidentPriority,
    location_name: ''
  });

  const handleCreateIncident = async () => {
    if (!newIncident.title.trim()) {
      toast.error('Please enter an incident title');
      return;
    }

    try {
      const created = await incidentService.create(newIncident);
      setIncidents(prev => [created, ...prev]);
      setIsCreateDialogOpen(false);
      setNewIncident({
        title: '',
        description: '',
        incident_type: 'general',
        priority: 'medium',
        location_name: ''
      });
      toast.success('Incident created successfully');
    } catch (error) {
      console.error('Error creating incident:', error);
      toast.error('Failed to create incident');
    }
  };

  const handleStatusUpdate = async (id: string, status: IncidentStatus) => {
    try {
      const updated = await incidentService.update(id, { status });
      setIncidents(prev => prev.map(inc => inc.id === id ? updated : inc));
      toast.success(`Incident status updated to ${status}`);
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Failed to update incident status');
    }
  };

  const getPriorityColor = (priority: IncidentPriority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const incidentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - incidentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Incident Management</h1>
              <p className="text-sm md:text-base text-muted-foreground">Monitor and manage security incidents</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  New Incident
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Incident</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Incident title"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Description"
                    value={newIncident.description}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Select value={newIncident.incident_type} onValueChange={(value: IncidentType) => 
                    setNewIncident(prev => ({ ...prev, incident_type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical_emergency">Medical Emergency</SelectItem>
                      <SelectItem value="security_threat">Security Threat</SelectItem>
                      <SelectItem value="crowd_density">Crowd Density</SelectItem>
                      <SelectItem value="lost_person">Lost Person</SelectItem>
                      <SelectItem value="fire_hazard">Fire Hazard</SelectItem>
                      <SelectItem value="weather">Weather</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newIncident.priority} onValueChange={(value: IncidentPriority) => 
                    setNewIncident(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Location"
                    value={newIncident.location_name}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, location_name: e.target.value }))}
                  />
                  <Button onClick={handleCreateIncident} className="w-full">
                    Create Incident
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-red-600">2</p>
              <p className="text-xs md:text-sm text-muted-foreground">Active</p>
            </div>
          </Card>
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-yellow-600">1</p>
              <p className="text-xs md:text-sm text-muted-foreground">Investigating</p>
            </div>
          </Card>
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-green-600">12</p>
              <p className="text-xs md:text-sm text-muted-foreground">Resolved</p>
            </div>
          </Card>
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-blue-600">15</p>
              <p className="text-xs md:text-sm text-muted-foreground">Total</p>
            </div>
          </Card>
        </div>

        {/* Incidents List */}
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className="p-4 md:p-6 bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-base md:text-lg font-semibold text-foreground">{incident.title}</h3>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(incident.priority)}>
                        {incident.priority}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {incident.description && (
                    <p className="text-sm md:text-base text-muted-foreground mb-3">{incident.description}</p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                    {incident.location_name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{incident.location_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(incident.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={incident.status} onValueChange={(value: IncidentStatus) => 
                    handleStatusUpdate(incident.id, value)
                  }>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="border-border hover:bg-accent">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredIncidents.length === 0 && (
          <Card className="p-8 md:p-12 bg-card border-border text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No incidents found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </Card>
        )}
      </div>
    </div>
  );
};
