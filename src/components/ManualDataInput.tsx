
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { crowdDataService } from '@/services/crowdDataService';

interface ManualDataEntry {
  location: string;
  capacity: number;
  currentCount: number;
  density: number;
  trend: 'up' | 'down' | 'stable';
  notes: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const ManualDataInput = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [entry, setEntry] = useState<ManualDataEntry>({
    location: '',
    capacity: 0,
    currentCount: 0,
    density: 0,
    trend: 'stable',
    notes: '',
    riskLevel: 'low'
  });

  const calculateDensity = (current: number, capacity: number) => {
    return capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  };

  const handleCurrentCountChange = (value: string) => {
    const current = parseInt(value) || 0;
    const density = calculateDensity(current, entry.capacity);
    let riskLevel: ManualDataEntry['riskLevel'] = 'low';
    
    if (density >= 90) riskLevel = 'critical';
    else if (density >= 75) riskLevel = 'high';
    else if (density >= 50) riskLevel = 'medium';
    
    setEntry(prev => ({
      ...prev,
      currentCount: current,
      density,
      riskLevel
    }));
  };

  const handleCapacityChange = (value: string) => {
    const capacity = parseInt(value) || 0;
    const density = calculateDensity(entry.currentCount, capacity);
    let riskLevel: ManualDataEntry['riskLevel'] = 'low';
    
    if (density >= 90) riskLevel = 'critical';
    else if (density >= 75) riskLevel = 'high';
    else if (density >= 50) riskLevel = 'medium';
    
    setEntry(prev => ({
      ...prev,
      capacity,
      density,
      riskLevel
    }));
  };

  const handleSave = () => {
    if (!entry.location.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    if (entry.capacity <= 0) {
      toast.error('Please enter a valid capacity');
      return;
    }

    // Add or update location data
    crowdDataService.updateLocation({
      name: entry.location,
      capacity: entry.capacity,
      current: entry.currentCount,
      density: entry.density,
      trend: entry.trend
    });

    toast.success(`Data saved for ${entry.location}`);
    
    // Reset form
    setEntry({
      location: '',
      capacity: 0,
      currentCount: 0,
      density: 0,
      trend: 'stable',
      notes: '',
      riskLevel: 'low'
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Card className="p-4 border-dashed border-2 border-gray-300 hover:border-primary/50 transition-colors">
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          className="w-full h-full min-h-[100px] flex flex-col items-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Plus className="w-8 h-8" />
          <span className="text-sm font-medium">Add Manual Data Entry</span>
          <span className="text-xs">Input crowd data for real-time analysis</span>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-2 border-primary">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Manual Data Entry</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Location Name</label>
          <Input
            value={entry.location}
            onChange={(e) => setEntry(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Main Stage, Gate 3, Food Court"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Max Capacity</label>
            <Input
              type="number"
              value={entry.capacity || ''}
              onChange={(e) => handleCapacityChange(e.target.value)}
              placeholder="1000"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Current Count</label>
            <Input
              type="number"
              value={entry.currentCount || ''}
              onChange={(e) => handleCurrentCountChange(e.target.value)}
              placeholder="750"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Trend</label>
            <Select value={entry.trend} onValueChange={(value: ManualDataEntry['trend']) => setEntry(prev => ({ ...prev, trend: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up">Increasing</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="down">Decreasing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Density: {entry.density}% 
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                entry.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                entry.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                entry.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {entry.riskLevel.toUpperCase()}
              </span>
            </label>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full transition-all ${
                  entry.riskLevel === 'critical' ? 'bg-red-500' :
                  entry.riskLevel === 'high' ? 'bg-orange-500' :
                  entry.riskLevel === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${entry.density}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Additional Notes</label>
          <Textarea
            value={entry.notes}
            onChange={(e) => setEntry(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional observations or concerns..."
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save Data
          </Button>
          <Button 
            onClick={() => setIsOpen(false)} 
            variant="outline" 
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};
