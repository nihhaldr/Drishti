import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, User, Bell, Shield, Camera, Wifi, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
export const Settings = () => {
  const {
    user,
    signOut
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'Drishti Command Center',
    location: 'Event Venue',
    timezone: 'UTC+05:30',
    language: 'en',
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    alertSounds: true,
    // Security
    sessionTimeout: '30',
    twoFactorAuth: false,
    automaticLockout: true,
    auditLogging: true,
    // Camera Settings
    videoQuality: 'high',
    recordingEnabled: true,
    motionDetection: true,
    nightVision: true,
    // System
    autoBackup: true,
    dataRetention: '90',
    systemUpdates: true,
    performanceMode: 'balanced'
  });
  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm md:text-base text-muted-foreground">Configure your Drishti system</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              System Online
            </Badge>
            <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-muted">
            <TabsTrigger value="general" className="flex items-center gap-2 text-xs md:text-sm">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs md:text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 text-xs md:text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="cameras" className="flex items-center gap-2 text-xs md:text-sm">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Cameras</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2 text-xs md:text-sm">
              <Wifi className="w-4 h-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="p-4 md:p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">General Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input id="systemName" value={settings.systemName} onChange={e => setSettings(prev => ({
                  ...prev,
                  systemName: e.target.value
                }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={settings.location} onChange={e => setSettings(prev => ({
                  ...prev,
                  location: e.target.value
                }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={value => setSettings(prev => ({
                  ...prev,
                  timezone: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC+05:30">IST (UTC+05:30)</SelectItem>
                      <SelectItem value="UTC+00:00">UTC (UTC+00:00)</SelectItem>
                      <SelectItem value="UTC-05:00">EST (UTC-05:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={value => setSettings(prev => ({
                  ...prev,
                  language: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* User Profile */}
            <Card className="p-4 md:p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">User Profile</h3>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label>Email</Label>
                    <p className="text-foreground">{user?.email || 'Not signed in'}</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">System Administrator</Badge>
                  </div>
                  <Button variant="outline" onClick={handleSignOut} className="border-border hover:bg-accent">
                    Sign Out
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-4 md:p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Alert Preferences</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    
                    
                  </div>
                  
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                  </div>
                  <Switch checked={settings.smsNotifications} onCheckedChange={value => setSettings(prev => ({
                  ...prev,
                  smsNotifications: value
                }))} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch checked={settings.pushNotifications} onCheckedChange={value => setSettings(prev => ({
                  ...prev,
                  pushNotifications: value
                }))} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label>Alert Sounds</Label>
                    <p className="text-sm text-muted-foreground">Play audio alerts</p>
                  </div>
                  <Switch checked={settings.alertSounds} onCheckedChange={value => setSettings(prev => ({
                  ...prev,
                  alertSounds: value
                }))} />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-4 md:p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Select value={settings.sessionTimeout} onValueChange={value => setSettings(prev => ({
                  ...prev,
                  sessionTimeout: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch checked={settings.twoFactorAuth} onCheckedChange={value => setSettings(prev => ({
                  ...prev,
                  twoFactorAuth: value
                }))} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label>Automatic Lockout</Label>
                    <p className="text-sm text-muted-foreground">Lock system after failed attempts</p>
                  </div>
                  <Switch checked={settings.automaticLockout} onCheckedChange={value => setSettings(prev => ({
                  ...prev,
                  automaticLockout: value
                }))} />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Cameras */}
          <TabsContent value="cameras" className="space-y-6">
            <Card className="p-4 md:p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Camera Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoQuality">Video Quality</Label>
                  <Select value={settings.videoQuality} onValueChange={value => setSettings(prev => ({
                  ...prev,
                  videoQuality: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (720p)</SelectItem>
                      <SelectItem value="medium">Medium (1080p)</SelectItem>
                      <SelectItem value="high">High (4K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label>Recording Enabled</Label>
                    <p className="text-sm text-muted-foreground">Save video recordings</p>
                  </div>
                  <Switch checked={settings.recordingEnabled} onCheckedChange={value => setSettings(prev => ({
                  ...prev,
                  recordingEnabled: value
                }))} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label>Motion Detection</Label>
                    <p className="text-sm text-muted-foreground">Detect movement in camera feeds</p>
                  </div>
                  <Switch checked={settings.motionDetection} onCheckedChange={value => setSettings(prev => ({
                  ...prev,
                  motionDetection: value
                }))} />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* System */}
          <TabsContent value="system" className="space-y-6">
            <Card className="p-4 md:p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">System Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention (days)</Label>
                  <Select value={settings.dataRetention} onValueChange={value => setSettings(prev => ({
                  ...prev,
                  dataRetention: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label>Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">Daily system backups</p>
                  </div>
                  <Switch checked={settings.autoBackup} onCheckedChange={value => setSettings(prev => ({
                  ...prev,
                  autoBackup: value
                }))} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">Automatic updates</p>
                  </div>
                  <Switch checked={settings.systemUpdates} onCheckedChange={value => setSettings(prev => ({
                  ...prev,
                  systemUpdates: value
                }))} />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};