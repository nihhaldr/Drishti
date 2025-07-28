
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Plus, Link } from 'lucide-react';
import { toast } from 'sonner';
import { LocationPicker } from '@/components/location/LocationPicker';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface ImportVideoDialogProps {
  onImportFile: (file: File, name: string, location: Location) => void;
  onImportStream: (url: string, name: string, location: Location) => void;
}

export const ImportVideoDialog = ({ onImportFile, onImportStream }: ImportVideoDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importType, setImportType] = useState<'file' | 'stream'>('file');
  const [name, setName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        if (!name) setName(file.name.replace(/\.[^/.]+$/, ''));
      } else {
        toast.error('Please select a video file (MP4, WebM, etc.)');
      }
    }
  };

  const handleImport = () => {
    if (!name || !selectedLocation) {
      toast.error('Please fill in camera name and select a location');
      return;
    }

    if (importType === 'file') {
      if (selectedFile) {
        onImportFile(selectedFile, name, selectedLocation);
        resetForm();
        setIsOpen(false);
        toast.success('Video file imported successfully');
      } else {
        toast.error('Please select a video file');
      }
    } else {
      if (streamUrl) {
        onImportStream(streamUrl, name, selectedLocation);
        resetForm();
        setIsOpen(false);
        toast.success('Stream URL added successfully');
      } else {
        toast.error('Please enter a stream URL');
      }
    }
  };

  const resetForm = () => {
    setName('');
    setSelectedLocation(null);
    setStreamUrl('');
    setSelectedFile(null);
    setImportType('file');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Import Video
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Import Video Feed</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={importType === 'file' ? 'default' : 'outline'}
              onClick={() => setImportType('file')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button
              variant={importType === 'stream' ? 'default' : 'outline'}
              onClick={() => setImportType('stream')}
              className="flex-1"
            >
              <Link className="w-4 h-4 mr-2" />
              Stream URL
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Camera Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Entrance"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Location</label>
            <LocationPicker
              onLocationSelect={setSelectedLocation}
              selectedLocation={selectedLocation}
              buttonText="Select Location"
              buttonVariant="outline"
            />
          </div>

          {importType === 'file' ? (
            <div>
              <label className="text-sm font-medium block mb-1">Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="w-full p-2 border border-input rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium block mb-1">Stream URL</label>
              <Input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or rtmp://..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supports YouTube, Twitch, RTMP, and other streaming URLs
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleImport} className="flex-1">
              Import
            </Button>
            <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
