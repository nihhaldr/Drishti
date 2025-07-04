
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Edit, Trash2, Settings, Radio, Download, Play, FileVideo } from 'lucide-react';
import { CameraFeed } from '@/types/cameraFeed';
import { VideoPlayer } from '@/components/VideoPlayer';
import { WebRTCPlayer } from '@/components/WebRTCPlayer';
import { LocalVideoPlayer } from '@/components/LocalVideoPlayer';
import { StreamPlayer } from '@/components/StreamPlayer';
import { IframeVideoPlayer } from '@/components/IframeVideoPlayer';

interface CameraCardProps {
  feed: CameraFeed;
  webrtcServerUrl: string;
  viewMode: 'grid' | 'single';
  onStatusChange: (feedId: number, status: CameraFeed['status']) => void;
  onFullscreen: (feed: CameraFeed) => void;
  onEdit: (feed: CameraFeed) => void;
  onDelete: (feedId: number) => void;
  onDownload?: (feed: CameraFeed) => void;
}

export const CameraCard = ({
  feed,
  webrtcServerUrl,
  viewMode,
  onStatusChange,
  onFullscreen,
  onEdit,
  onDelete,
  onDownload
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

  const renderVideoPlayer = () => {
    // Use LocalVideoPlayer for imported video files
    if (feed.isLocalFile && feed.videoUrl) {
      return (
        <LocalVideoPlayer
          feed={feed}
          onStatusChange={onStatusChange}
          onFullscreen={() => onFullscreen(feed)}
        />
      );
    } else if (feed.isWebRTC) {
      return (
        <WebRTCPlayer
          serverUrl={webrtcServerUrl}
          streamId={feed.streamId}
          onPlayStarted={(id) => onStatusChange(feed.id, 'live')}
          onPlayStopped={(id) => onStatusChange(feed.id, 'offline')}
          onFullscreen={() => onFullscreen(feed)}
        />
      );
    } else if (feed.streamUrl && (feed.streamUrl.includes('youtube.com') || feed.streamUrl.includes('twitch.tv'))) {
      return (
        <StreamPlayer
          feed={feed}
          onStatusChange={onStatusChange}
          onFullscreen={() => onFullscreen(feed)}
        />
      );
    } else if (feed.streamUrl) {
      // Use iframe player for general stream URLs
      return (
        <IframeVideoPlayer
          feed={feed}
          onStatusChange={onStatusChange}
          onFullscreen={() => onFullscreen(feed)}
        />
      );
    } else {
      return (
        <VideoPlayer 
          feed={feed} 
          onStatusChange={onStatusChange}
          onFullscreen={() => onFullscreen(feed)}
        />
      );
    }
  };

  return (
    <div className="overflow-hidden">
      <div className={`bg-black relative ${
        viewMode === 'single' ? 'aspect-video' : 'aspect-video'
      }`}>
        {renderVideoPlayer()}
        
        {/* Status Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(feed.status)} ${
            feed.status === 'live' ? 'animate-pulse' : ''
          }`}></div>
          <span className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded backdrop-blur flex items-center gap-1">
            {getStatusText(feed.status)} 
            {feed.isWebRTC && <Radio className="w-3 h-3" />}
            {feed.isLocalFile && <FileVideo className="w-3 h-3" />}
          </span>
        </div>

        {/* File Info Badge */}
        {feed.isLocalFile && feed.fileSize && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <span className="text-white text-xs bg-blue-600/90 px-2 py-1 rounded backdrop-blur">
              {(feed.fileSize / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        )}

        {/* Alerts Badge */}
        {feed.alerts > 0 && (
          <div className="absolute top-10 sm:top-11 right-2 sm:right-3">
            <div className="flex items-center gap-1 bg-red-600/90 text-white px-2 py-1 rounded text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              {feed.alerts}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {feed.isLocalFile && onDownload && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDownload(feed)}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-green-600/90 hover:bg-green-700/90 text-white"
              title="Download video file"
            >
              <Download className="w-3 h-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(feed)}
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-black/70 hover:bg-black/90"
            title="Edit camera settings"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(feed.id)}
            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
            title="Delete camera feed"
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
            <span className="text-sm text-muted-foreground capitalize flex items-center gap-1">
              {feed.status} 
              {feed.isWebRTC && <span className="text-xs">(WebRTC)</span>}
              {feed.isLocalFile && <span className="text-xs">(Local)</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!feed.isLocalFile && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {feed.viewers} viewers
              </span>
            )}
            {feed.uploadedAt && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {new Date(feed.uploadedAt).toLocaleDateString()}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => onEdit(feed)}
              title="Camera settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
