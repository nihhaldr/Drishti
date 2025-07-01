
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, MapPin, Clock, User, Trash2 } from 'lucide-react';
import { incidentService, Incident, CreateIncidentRequest } from '@/services/incidentService';
import { toast } from 'sonner';
import { LocationPicker } from '@/components/location/LocationPicker';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const IncidentManagement = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newIncident, setNewIncident] = useState<CreateIncidentRequest>({
    title: '',
    description: '',
    incident_type: 'general',
    priority: 'medium',
    location_name: '',
    latitude: undefined,
    longitude: undefined
  });

  useEffect(() => {
    loadIncidents();
    
    const unsubscribe = incidentService.subscribe((newIncidents) => {
      setIncidents(newIncidents);
    });

    return unsubscribe;
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await incidentService.getAll();
      setIncidents(data);
    } catch (error) {
      console.error('Error loading incidents:', error);
      toast.error('Failed to load incidents');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-blue-500';
      case 'investigating': return 'bg-purple-500';
      case 'active': return 'bg-red-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCreateIncident = async () => {
    try {
      await incidentService.create(newIncident);
      setIsCreateDialogOpen(false);
      setNewIncident({
        title: '',
        description: '',
        incident_type: 'general',
        priority: 'medium',
        location_name: '',
        latitude: undefined,
        longitude: undefined
      });
      toast.success('Incident created successfully');
    } catch (error) {
      console.error('Error creating incident:', error);
      toast.error('Failed to create incident');
    }
  };

  const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
    try {
      await incidentService.update(incidentId, { status: newStatus as any });
      toast.success('Incident status updated');
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Failed to update incident status');
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      // Since there's no delete method in the service, we'll mark it as closed
      await incidentService.update(incidentId, { status: 'closed' });
      toast.success('Incident removed successfully');
    } catch (error) {
      console.error('Error removing incident:', error);
      toast.error('Failed to remove incident');
    }
  };

  const handleLocationSelect = (location: any) => {
    setNewIncident(prev => ({
      ...prev,
      location_name: location.name,
      latitude: location.latitude,
      longitude: location.longitude
    }));
  };

  const activeIncidents = incidents.filter(incident => 
    incident.status !== 'closed' && incident.status !== 'resolved'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Incident Management</h2>
          <p className="text-gray-600">Monitor and manage active incidents</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the incident"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newIncident.description || ''}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the incident"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={newIncident.incident_type} 
                    onValueChange={(value) => setNewIncident(prev => ({ ...prev, incident_type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="crowd_density">Crowd Density</SelectItem>
                      <SelectItem value="medical_emergency">Medical Emergency</SelectItem>
                      <SelectItem value="security_threat">Security Threat</SelectItem>
                      <SelectItem value="lost_person">Lost Person</SelectItem>
                      <SelectItem value="fire_hazard">Fire Hazard</SelectItem>
                      <SelectItem value="weather">Weather</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={newIncident.priority} 
                    onValueChange={(value) => setNewIncident(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Location</Label>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={newIncident.location_name ? {
                    name: newIncident.location_name,
                    latitude: newIncident.latitude || 0,
                    longitude: newIncident.longitude || 0
                  } : null}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateIncident}
                  disabled={!newIncident.title.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Report Incident
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeIncidents.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {activeIncidents.filter(i => i.priority === 'critical').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">
                {activeIncidents.filter(i => i.priority === 'high').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">
                {incidents.filter(i => i.status === 'resolved' && 
                  new Date(i.updated_at).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Incidents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Incidents</h3>
        
        {activeIncidents.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Incidents</h3>
            <p className="text-gray-600">All incidents have been resolved or closed.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeIncidents.map((incident) => (
              <Card key={incident.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{incident.title}</h4>
                      <Badge className={`${getPriorityColor(incident.priority)} text-white text-xs`}>
                        {incident.priority.toUpperCase()}
                      </Badge>
                      <Badge className={`${getStatusColor(incident.status)} text-white text-xs`}>
                        {incident.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {incident.description && (
                      <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(incident.created_at).toLocaleString()}</span>
                      </div>
                      
                      {incident.location_name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{incident.location_name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="capitalize">{incident.incident_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Select
                      value={incident.status}
                      onValueChange={(value) => handleStatusUpdate(incident.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reported">Reported</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Incident</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this incident? This action will mark it as closed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteIncident(incident.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
