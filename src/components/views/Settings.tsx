
import React from 'react';
import { Card } from '@/components/ui/card';
import { Settings as SettingsIcon, Bell, Camera, Users, Shield, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-400" />
          System Settings
        </h1>
        <p className="text-slate-400">Configure Drishti platform settings</p>
      </div>

      {/* System Status */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-blue-400" />
              <span className="text-white">Camera Network</span>
            </div>
            <Badge className="bg-green-600 text-white">Online</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-white">AI Processing</span>
            </div>
            <Badge className="bg-green-600 text-white">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Map className="w-5 h-5 text-red-400" />
              <span className="text-white">Emergency Systems</span>
            </div>
            <Badge className="bg-green-600 text-white">Ready</Badge>
          </div>
        </div>
      </Card>

      {/* Alert Settings */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alert Configuration
        </h2>
        <div className="space-y-4">
          {[
            { name: 'High Crowd Density Threshold', value: '85%', description: 'Alert when crowd reaches this capacity' },
            { name: 'Emergency Response Time', value: '2 minutes', description: 'Maximum time before escalation' },
            { name: 'AI Confidence Threshold', value: '90%', description: 'Minimum confidence for automated alerts' },
            { name: 'Social Media Monitoring', value: 'Enabled', description: 'Real-time sentiment analysis' }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">{setting.name}</h3>
                <p className="text-sm text-slate-400">{setting.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400 font-medium">{setting.value}</span>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Integration Settings */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">External Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Google Maps API', status: 'Connected', icon: Map },
            { name: 'Firebase Database', status: 'Connected', icon: Shield },
            { name: 'Vertex AI', status: 'Connected', icon: Users },
            { name: 'Emergency Services', status: 'Pending', icon: Bell }
          ].map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <integration.icon className="w-5 h-5 text-blue-400" />
                <span className="text-white">{integration.name}</span>
              </div>
              <Badge className={integration.status === 'Connected' ? 'bg-green-600' : 'bg-yellow-600'}>
                {integration.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* User Management */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Management
        </h2>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-300">Manage user access and permissions</p>
            <p className="text-sm text-slate-500">Currently 12 active users</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Manage Users
          </Button>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Data & Privacy</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Data Retention Period</span>
            <span className="text-blue-400">30 days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Encryption Status</span>
            <Badge className="bg-green-600 text-white">Enabled</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Backup Frequency</span>
            <span className="text-blue-400">Every 6 hours</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
