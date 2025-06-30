
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Edit, Trash2, Settings, Radio } from 'lucide-react';
import { CameraFeed } from '@/types/cameraFeed';
import { VideoPlayer } from '@/components/VideoPlayer';
import { WebRTCPlayer } from '@/components/WebRTCPlayer';

interface CameraCardProps {
  feed: CameraFeed;
  webrtcServerUrl: string;
  viewMode: 'grid' | 'single';
  onStatusChange: (feedId: number, status: CameraFeed['status']) => void;
  onFullscreen: (feed: CameraFeed) => void;
  onEdit: (feed: CameraFeed) => void;
  onDelete: (feedId: number) => void;
}

export const CameraCard = ({
  feed,
  webrtcServerUrl,
  viewMode,
  onStatusChange,
  onFullscreen,
  onEdit,
  onDelete
}: CameraCardProps) => {
  const getStatusColor = (status: CameraFeed['status']) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: CameraFeed['status']) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'connecting': return 'CONNECTING';
      case 'error': return 'ERROR';
      default: return 'OFFLINE';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className={`bg-black relative ${
        viewMode === 'single' ? 'aspect-video' : 'aspect-video'
      }`}>
        {feed.isWebRTC ? (
          <WebRTCPlayer
            serverUrl={webrtcServerUrl}
            streamId={feed.streamId}
            onPlayStarted={(id) => onStatusChange(feed.id, 'live')}
            onPlayStopped={(id) => onStatusChange(feed.id, 'offline')}
            onFullscreen={() => onFullscreen(feed)}
          />
        ) : (
          <VideoPlayer 
            feed={feed} 
            onStatusChange={onStatusChange}
            onFullscreen={() => onFullscreen(feed)}
          />
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(feed.status)} ${
            feed.status === 'live' ? 'animate-pulse' : ''
          }`}></div>
          <span className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded backdrop-blur">
            {getStatusText(feed.status)} {feed.isWebRTC && <Radio className="w-3 h-3 inline ml-1" />}
          </span>
        </div>

        {/* Alerts Badge */}
        {feed.alerts > 0 && (
          <div className="absolute top-2 sm:top-3 right-12 sm:right-14">
            <div className="flex items-center gap-1 bg-red-600/90 text-white px-2 py-1 rounded text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              {feed.alerts}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(feed)}
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-black/70 hover:bg-black/90"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(feed.id)}
            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${
              feed.status === 'live' ? 'text-green-500' : 
              feed.status === 'connecting' ? 'text-yellow-500' : 
              'text-gray-400'
            }`} />
            <span className="text-sm text-muted-foreground capitalize">
              {feed.status} {feed.isWebRTC && '(WebRTC)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {feed.viewers} viewers
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => onEdit(feed)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
