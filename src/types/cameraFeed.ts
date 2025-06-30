
export interface CameraFeed {
  id: number;
  name: string;
  status: 'live' | 'offline' | 'connecting' | 'error';
  viewers: number;
  location: string;
  alerts: number;
  streamUrl?: string;
  streamId?: string;
  isWebRTC?: boolean;
  isRecording?: boolean;
}
