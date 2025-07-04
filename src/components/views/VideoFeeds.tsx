
import React from 'react';
import { Card } from '@/components/ui/card';
import { Video } from 'lucide-react';

export const VideoFeeds = () => {
  return (
    <div className="p-6 bg-background min-h-full">
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 text-center max-w-md">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Video Feeds
          </h2>
          <p className="text-gray-500">
            Video surveillance functionality has been removed as requested.
          </p>
        </Card>
      </div>
    </div>
  );
};
