
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ManualDataForm } from '@/components/manual-data/ManualDataForm';
import { LocationData } from '@/services/crowdDataService';

interface ManualDataInputProps {
  editingLocation?: LocationData | null;
  onEditComplete?: () => void;
}

export const ManualDataInput = ({ editingLocation, onEditComplete }: ManualDataInputProps) => {
  const [isOpen, setIsOpen] = useState(!!editingLocation);

  const handleSave = () => {
    setIsOpen(false);
    if (editingLocation && onEditComplete) {
      onEditComplete();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (editingLocation && onEditComplete) {
      onEditComplete();
    }
  };

  if (!isOpen && !editingLocation) {
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
      <ManualDataForm
        editingLocation={editingLocation}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Card>
  );
};
