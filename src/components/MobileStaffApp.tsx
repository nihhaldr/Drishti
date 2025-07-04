import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { QrCode, Smartphone, AlertTriangle, Bell, Camera, MapPin, Plus, X, User, Clock, Shield, Heart, Plane } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WhatsAppService } from '@/services/whatsappService';
import { toast } from 'sonner';
interface StaffMember {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Standby' | 'Offline';
  lastUpdate: string;
  role: string;
}
export const MobileStaffApp = () => {
  const [qrCode, setQrCode] = useState('');
  const [connectedStaff, setConnectedStaff] = useState<StaffMember[]>([{
    id: '1',
    name: 'Security Team Alpha',
    location: 'Main Gate',
    status: 'Active',
    lastUpdate: '2 min ago',
    role: 'Security'
  }, {
    id: '2',
    name: 'Medical Unit 1',
    location: 'Food Court',
    status: 'Standby',
    lastUpdate: '5 min ago',
    role: 'Medical'
  }, {
    id: '3',
    name: 'Safety Officer Mike',
    location: 'VIP Area',
    status: 'Active',
    lastUpdate: '1 min ago',
    role: 'Safety'
  }]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    location: '',
    status: 'Active' as 'Active' | 'Standby' | 'Offline',
    role: ''
  });
  const [deploymentLocation, setDeploymentLocation] = useState('');
  const whatsappService = WhatsAppService.getInstance();
  const targetPhoneNumber = '10225511'; // 9110225511 without country code

  useEffect(() => {
    // Generate QR code URL for mobile app download
    setQrCode('https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=https://safety-command-mobile.app');
  }, []);
  const handleAddStaff = () => {
    if (newStaff.name && newStaff.location && newStaff.role) {
      const staff: StaffMember = {
        id: Date.now().toString(),
        name: newStaff.name,
        location: newStaff.location,
        status: newStaff.status,
        lastUpdate: 'Just now',
        role: newStaff.role
      };
      setConnectedStaff([...connectedStaff, staff]);
      setNewStaff({
        name: '',
        location: '',
        status: 'Active',
        role: ''
      });
      setIsAddingStaff(false);
    }
  };
  const handleRemoveStaff = (id: string) => {
    setConnectedStaff(connectedStaff.filter(staff => staff.id !== id));
  };
  const handleStatusChange = (id: string, newStatus: 'Active' | 'Standby' | 'Offline') => {
    setConnectedStaff(connectedStaff.map(staff => staff.id === id ? {
      ...staff,
      status: newStatus,
      lastUpdate: 'Just now'
    } : staff));
  };
  const handleDeployTeam = async (teamType: string) => {
    if (!deploymentLocation) {
      toast.error('Please enter deployment location');
      return;
    }
    const message = whatsappService.generateDeploymentMessage(teamType, deploymentLocation);
    try {
      const success = await whatsappService.sendMessage({
        to: targetPhoneNumber,
        message,
        type: 'deployment'
      });
      if (success) {
        toast.success(`${teamType} deployment request sent via WhatsApp`);
        setDeploymentLocation('');
      } else {
        toast.error('Failed to send deployment request');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('Failed to send deployment request');
    }
  };
  return <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Staff Integration</h1>
          <p className="text-gray-600">Connect field staff with real-time updates and emergency reporting</p>
        </div>
        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
          <Smartphone className="w-4 h-4 mr-1" />
          {connectedStaff.length} Staff Connected
        </Badge>
      </div>

      {/* Emergency Deployment Section */}
      <Card className="bg-red-50 border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Emergency Team Deployment
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-800 mb-2">Deployment Location</label>
            <Input value={deploymentLocation} onChange={e => setDeploymentLocation(e.target.value)} placeholder="Enter location for team deployment" className="border-red-300 focus:border-red-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button onClick={() => handleDeployTeam('Security Team')} disabled={!deploymentLocation} className="text-white flex items-center gap-2 bg-google-red">
              <Shield className="w-4 h-4" />
              Deploy Security
            </Button>
            <Button onClick={() => handleDeployTeam('Medical Team')} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2" disabled={!deploymentLocation}>
              <Heart className="w-4 h-4" />
              Deploy Medical
            </Button>
            <Button onClick={() => handleDeployTeam('Drone Unit')} disabled={!deploymentLocation} className="text-white flex items-center gap-2 bg-google-blue">
              <Plane className="w-4 h-4" />
              Deploy Drone
            </Button>
          </div>
          
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code for App Download */}
        <Card className="bg-white border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile App Access</h3>
          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="QR Code" className="w-48 h-48 border rounded-lg" />
          </div>
          <p className="text-gray-600 mb-4">Scan QR code to download the Drishti Mobile Staff App</p>
          <p className="text-xs text-gray-500">Available for iOS and Android</p>
        </Card>

        {/* Mobile Features */}
        <Card className="bg-white border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile App Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900">Emergency Reporting</h4>
                <p className="text-sm text-red-700">One-tap emergency alerts with location</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Live Alerts</h4>
                <p className="text-sm text-blue-700">Receive real-time notifications</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
              <Camera className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Photo Reporting</h4>
                <p className="text-sm text-green-700">Upload incident photos instantly</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Connected Staff Status */}
      <Card className="bg-white border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Connected Staff Management
          </h3>
          <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Staff Name" value={newStaff.name} onChange={e => setNewStaff({
                ...newStaff,
                name: e.target.value
              })} />
                <Input placeholder="Location" value={newStaff.location} onChange={e => setNewStaff({
                ...newStaff,
                location: e.target.value
              })} />
                <Input placeholder="Role (e.g., Security, Medical, Safety)" value={newStaff.role} onChange={e => setNewStaff({
                ...newStaff,
                role: e.target.value
              })} />
                <Select value={newStaff.status} onValueChange={(value: 'Active' | 'Standby' | 'Offline') => setNewStaff({
                ...newStaff,
                status: value
              })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Standby">Standby</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleAddStaff} className="flex-1">Add Staff</Button>
                  <Button variant="outline" onClick={() => setIsAddingStaff(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedStaff.map(staff => <div key={staff.id} className="p-4 bg-gray-50 rounded-lg relative">
              <Button variant="ghost" size="sm" onClick={() => handleRemoveStaff(staff.id)} className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center justify-between mb-2 pr-8">
                <h4 className="font-medium text-gray-900">{staff.name}</h4>
                <Select value={staff.status} onValueChange={(value: 'Active' | 'Standby' | 'Offline') => handleStatusChange(staff.id, value)}>
                  <SelectTrigger className="w-20 h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Standby">Standby</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {staff.location}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {staff.role}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {staff.lastUpdate}
                </p>
              </div>
            </div>)}
        </div>
      </Card>
    </div>;
};