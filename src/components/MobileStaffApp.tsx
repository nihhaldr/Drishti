
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, AlertTriangle, Bell, Camera, MapPin } from 'lucide-react';

export const MobileStaffApp = () => {
  const [qrCode, setQrCode] = useState('');
  const [staffConnected, setStaffConnected] = useState(12);

  useEffect(() => {
    // Generate QR code URL for mobile app download
    setQrCode('https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=https://safety-command-mobile.app');
  }, []);

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Staff Integration</h1>
          <p className="text-gray-600">Connect field staff with real-time updates and emergency reporting</p>
        </div>
        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
          <Smartphone className="w-4 h-4 mr-1" />
          {staffConnected} Staff Connected
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code for App Download */}
        <Card className="bg-white border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile App Access</h3>
          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="QR Code" className="w-48 h-48 border rounded-lg" />
          </div>
          <p className="text-gray-600 mb-4">Scan QR code to download the Drishti Mobile Staff App</p>
          <div className="space-y-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <QrCode className="w-4 h-4 mr-2" />
              Generate Staff QR Code
            </Button>
            <p className="text-xs text-gray-500">Available for iOS and Android</p>
          </div>
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
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded border-l-4 border-purple-500">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-purple-900">GPS Tracking</h4>
                <p className="text-sm text-purple-700">Real-time staff location updates</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Connected Staff Status */}
      <Card className="bg-white border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Staff</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Security Team Alpha', location: 'Main Gate', status: 'Active', lastUpdate: '2 min ago' },
            { name: 'Medical Unit 1', location: 'Food Court', status: 'Standby', lastUpdate: '5 min ago' },
            { name: 'Safety Officer Mike', location: 'VIP Area', status: 'Active', lastUpdate: '1 min ago' },
          ].map((staff, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{staff.name}</h4>
                <Badge className={staff.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'} variant="outline">
                  {staff.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{staff.location}</p>
              <p className="text-xs text-gray-500">Updated {staff.lastUpdate}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
