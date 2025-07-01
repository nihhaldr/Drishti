
import React, { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { alertService } from '@/services/alertService';
import { toast } from 'sonner';

export const TopBar = ({ onToggleAlerts }: { onToggleAlerts?: () => void }) => {
  const [query, setQuery] = useState('');

  const playEmergencySound = () => {
    // Create an audio context for the siren sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a simple siren sound effect
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure the siren sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  };

  const handleEmergencyAlert = async () => {
    try {
      // Play siren sound
      playEmergencySound();
      
      // Create emergency alert
      await alertService.create({
        title: 'Emergency Alert Activated',
        message: 'Emergency alert has been triggered from Command Center',
        alert_type: 'general',
        severity: 'critical',
        is_active: true,
        location_name: 'Command Center'
      });
      
      toast.error('Emergency Alert Activated - Siren Sound Played');
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      toast.error('Failed to create emergency alert');
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Drishti AI anything... (e.g., 'Show me crowd density at Gate 3')"
          className="pl-10 bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-google-blue focus:ring-google-blue/20"
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Emergency Button */}
        <Button 
          onClick={handleEmergencyAlert}
          className="bg-google-red hover:bg-red-600 text-white shadow-md"
        >
          Emergency Alert
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-google-blue hover:bg-gray-50"
            onClick={onToggleAlerts}
          >
            <Bell size={20} />
          </Button>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-google-red rounded-full flex items-center justify-center">
            <span className="text-xs text-white">3</span>
          </div>
        </div>

        {/* User Profile */}
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-google-blue hover:bg-gray-50">
          <User size={20} />
        </Button>
      </div>
    </div>
  );
};
