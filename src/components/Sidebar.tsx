
import React from 'react';
import { 
  Camera, 
  Users, 
  Settings, 
  Bell,
  Map,
  TrendingUp,
  Brain,
  Eye,
  UserSearch,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedView: string;
  setSelectedView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: Map },
  { id: 'feeds', label: 'Video Feeds', icon: Camera },
  { id: 'crowd', label: 'Crowd Analysis', icon: Users },
  { id: 'incidents', label: 'Incidents', icon: Bell },
  { id: 'bottleneck', label: 'Bottleneck Analysis', icon: TrendingUp },
  { id: 'search', label: 'AI Assistant', icon: Brain },
  { id: 'anomaly', label: 'Anomaly Detection', icon: Eye },
  { id: 'lost-found', label: 'Lost & Found', icon: UserSearch },
  { id: 'mobile', label: 'Mobile Staff App', icon: Smartphone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ selectedView, setSelectedView, collapsed, setCollapsed }: SidebarProps) => {
  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-google-blue to-google-red rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">Drishti</h1>
              <p className="text-xs text-gray-500">Command Center</p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <span className="text-xs">{collapsed ? '→' : '←'}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all duration-200 text-left",
                selectedView === item.id
                  ? "bg-google-blue text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50 hover:text-google-blue"
              )}
            >
              <Icon size={20} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Status */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-google-green rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">System Online</span>
          </div>
          <div className="text-xs text-gray-400">
            Last sync: Just now
          </div>
        </div>
      )}
    </div>
  );
};
