
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { crowdDataService, LocationData } from '@/services/crowdDataService';

interface ManualDataEntry {
  location: string;
  capacity: number;
  currentCount: number;
  density: number;
  trend: 'up' | 'down' | 'stable';
  notes: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ManualDataFormProps {
  editingLocation?: LocationData | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ManualDataForm = ({ editingLocation, onSave, onCancel }: ManualDataFormProps) => {
  const [entry, setEntry] = useState<ManualDataEntry>({
    location: editingLocation?.name || '',
    capacity: editingLocation?.capacity || 0,
    currentCount: editingLocation?.current || 0,
    density: editingLocation?.density || 0,
    trend: editingLocation?.trend || 'stable',
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

    crowdDataService.updateLocation({
      name: entry.location,
      capacity: entry.capacity,
      current: entry.currentCount,
      density: entry.density,
      trend: entry.trend
    });

    toast.success(`Data ${editingLocation ? 'updated' : 'saved'} for ${entry.location}`);
    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">
          {editingLocation ? 'Edit Location Data' : 'Manual Data Entry'}
        </h3>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Location Name</label>
        <Input
          value={entry.location}
          onChange={(e) => setEntry(prev => ({ ...prev, location: e.target.value }))}
          placeholder="e.g., Main Stage, Gate 3, Food Court"
          disabled={!!editingLocation}
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
          {editingLocation ? 'Update Data' : 'Save Data'}
        </Button>
        <Button 
          onClick={onCancel} 
          variant="outline" 
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
