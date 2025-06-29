
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Eye } from 'lucide-react';

export const AnomalyDetection = () => {
  const [visualFile, setVisualFile] = useState<File | null>(null);
  const [textualDescription, setTextualDescription] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVisualFile(file);
    }
  };

  const handleDetectAnomaly = async () => {
    if (!visualFile && !textualDescription.trim()) {
      return;
    }

    setIsDetecting(true);
    
    // Simulate anomaly detection
    setTimeout(() => {
      setIsDetecting(false);
      // Here you would handle the detection results
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Anomaly Detection</h1>
            </div>
            <p className="text-gray-600 mb-8">Analyze visual and textual data for potential threats.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Visual Input
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                  />
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-700">
                        {visualFile ? visualFile.name : 'Choose File No file chosen'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Textual Description
                </label>
                <Textarea
                  value={textualDescription}
                  onChange={(e) => setTextualDescription(e.target.value)}
                  placeholder="e.g., 'Crowd at main stage seems agitated.'"
                  className="min-h-[120px] bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <Button
                onClick={handleDetectAnomaly}
                disabled={isDetecting || (!visualFile && !textualDescription.trim())}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
              >
                {isDetecting ? 'Detecting...' : 'Detect Anomaly'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
