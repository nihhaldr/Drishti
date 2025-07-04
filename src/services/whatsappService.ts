
export interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'deployment' | 'emergency' | 'notification';
}

export class WhatsAppService {
  private static instance: WhatsAppService;
  private readonly apiUrl = 'https://api.whatsapp.com/send';

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  async sendMessage(messageData: WhatsAppMessage): Promise<boolean> {
    try {
      // For demo purposes, we'll open WhatsApp web with pre-filled message
      const encodedMessage = encodeURIComponent(messageData.message);
      const whatsappUrl = `${this.apiUrl}?phone=91${messageData.to}&text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      console.log('WhatsApp message sent:', messageData);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  generateDeploymentMessage(teamType: string, location: string): string {
    const timestamp = new Date().toLocaleString();
    return `🚨 EMERGENCY DEPLOYMENT ALERT 🚨

Team Type: ${teamType}
Location: ${location}
Time: ${timestamp}

Please respond to this emergency deployment request immediately. Your quick response is critical for ensuring public safety.

Status: URGENT
Command Center: Drishti Safety Platform`;
  }
}
