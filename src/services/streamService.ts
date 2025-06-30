
export interface StreamConfig {
  url: string;
  type: 'rtsp' | 'http' | 'hls' | 'mjpeg';
  username?: string;
  password?: string;
}

export class StreamService {
  private static instance: StreamService;
  private streams: Map<string, MediaStream> = new Map();

  static getInstance(): StreamService {
    if (!StreamService.instance) {
      StreamService.instance = new StreamService();
    }
    return StreamService.instance;
  }

  async getStream(config: StreamConfig): Promise<string> {
    try {
      // Convert RTSP to HTTP stream URL for web compatibility
      if (config.type === 'rtsp') {
        // Convert RTSP to HTTP streaming URL
        const httpUrl = this.convertRtspToHttp(config.url);
        return httpUrl;
      }

      // Handle HLS streams
      if (config.type === 'hls') {
        return config.url;
      }

      // Handle MJPEG streams
      if (config.type === 'mjpeg') {
        return config.url;
      }

      // Handle HTTP streams
      return config.url;
    } catch (error) {
      console.error('Error getting stream:', error);
      throw new Error('Failed to get stream');
    }
  }

  private convertRtspToHttp(rtspUrl: string): string {
    // This is a simplified conversion - in production you'd need a streaming server
    // For demo purposes, we'll try to detect common IP camera HTTP endpoints
    try {
      const url = new URL(rtspUrl);
      const host = url.hostname;
      const port = url.port || '554';
      
      // Common HTTP streaming endpoints for IP cameras
      const httpEndpoints = [
        `http://${host}:${parseInt(port) + 1}/video`,
        `http://${host}/video.cgi`,
        `http://${host}/videostream.cgi`,
        `http://${host}/mjpg/video.mjpg`,
        `http://${host}/axis-cgi/mjpg/video.cgi`
      ];

      return httpEndpoints[0]; // Return first endpoint for demo
    } catch (error) {
      console.error('Error converting RTSP URL:', error);
      return rtspUrl; // Return original if conversion fails
    }
  }

  detectStreamType(url: string): StreamConfig['type'] {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('rtsp://')) return 'rtsp';
    if (urlLower.includes('.m3u8')) return 'hls';
    if (urlLower.includes('mjpg') || urlLower.includes('mjpeg')) return 'mjpeg';
    
    return 'http';
  }

  async testStream(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Handle CORS issues
      });
      return true;
    } catch (error) {
      console.log('Stream test failed:', error);
      return false;
    }
  }
}
