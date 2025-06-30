
import { WebRTCAdaptor } from '@antmedia/webrtc_adaptor';

export interface WebRTCConfig {
  websocketURL: string;
  mediaConstraints: MediaStreamConstraints;
  iceServers?: RTCIceServer[];
  debug?: boolean;
}

export interface StreamCallbacks {
  onInitialized?: () => void;
  onPublishStarted?: (streamId: string) => void;
  onPublishFinished?: (streamId: string) => void;
  onPlayStarted?: (streamId: string) => void;
  onPlayFinished?: (streamId: string) => void;
  onError?: (error: string, data?: any) => void;
  onICEConnectionStateChange?: (state: RTCIceConnectionState, streamId: string) => void;
}

export class WebRTCService {
  private static instance: WebRTCService;
  private adaptor: WebRTCAdaptor | null = null;
  private config: WebRTCConfig | null = null;

  static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  initialize(config: WebRTCConfig, callbacks: StreamCallbacks): WebRTCAdaptor {
    this.config = config;

    const adaptorConfig = {
      websocket_url: config.websocketURL,
      mediaConstraints: config.mediaConstraints,
      peerconnection_config: {
        iceServers: config.iceServers || [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      },
      sdp_constraints: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
      },
      debug: config.debug || false,
      callback: (info: string, obj?: any) => {
        console.log('WebRTC Callback:', info, obj);
        
        switch (info) {
          case 'initialized':
            callbacks.onInitialized?.();
            break;
          case 'publish_started':
            callbacks.onPublishStarted?.(obj?.streamId);
            break;
          case 'publish_finished':
            callbacks.onPublishFinished?.(obj?.streamId);
            break;
          case 'play_started':
            callbacks.onPlayStarted?.(obj?.streamId);
            break;
          case 'play_finished':
            callbacks.onPlayFinished?.(obj?.streamId);
            break;
          case 'ice_connection_state_changed':
            callbacks.onICEConnectionStateChange?.(obj?.state, obj?.streamId);
            break;
          default:
            if (info.includes('error') || info.includes('failed')) {
              callbacks.onError?.(info, obj);
            }
            break;
        }
      },
      callbackError: (error: string, message?: any) => {
        console.error('WebRTC Error:', error, message);
        callbacks.onError?.(error, message);
      }
    };

    this.adaptor = new WebRTCAdaptor(adaptorConfig);
    return this.adaptor;
  }

  publishStream(streamId: string): void {
    if (!this.adaptor) {
      throw new Error('WebRTC adaptor not initialized');
    }
    this.adaptor.publish(streamId);
  }

  playStream(streamId: string): void {
    if (!this.adaptor) {
      throw new Error('WebRTC adaptor not initialized');
    }
    this.adaptor.play(streamId);
  }

  stopPublishing(streamId: string): void {
    if (this.adaptor) {
      this.adaptor.stop(streamId);
    }
  }

  stopPlaying(streamId: string): void {
    if (this.adaptor) {
      this.adaptor.stop(streamId);
    }
  }

  getAdaptor(): WebRTCAdaptor | null {
    return this.adaptor;
  }

  destroy(): void {
    if (this.adaptor) {
      this.adaptor.closeWebSocket();
      this.adaptor = null;
    }
  }
}
