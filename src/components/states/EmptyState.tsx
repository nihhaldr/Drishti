
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddCamera: () => void;
}

export const EmptyState = ({ onAddCamera }: EmptyStateProps) => {
  return (
    <Card className="p-8 sm:p-12 text-center">
      <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">No Camera Feeds</h3>
      <p className="text-muted-foreground mb-4 text-sm">Add your first camera feed to start monitoring</p>
      <Button onClick={onAddCamera} className="bg-green-600 hover:bg-green-700 text-white">
        <Plus className="w-4 h-4 mr-2" />
        Add Camera
      </Button>
    </Card>
  );
};
