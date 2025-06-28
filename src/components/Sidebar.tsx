
import React from 'react';
import { 
  Camera, 
  Users, 
  Search, 
  Settings, 
  Bell,
  Map
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
  { id: 'search', label: 'AI Search', icon: Search },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ selectedView, setSelectedView, collapsed, setCollapsed }: SidebarProps) => {
  return (
    <div className={cn(
      "bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">Drishti</h1>
              <p className="text-xs text-slate-400">Command Center</p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -right-3 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white hover:bg-slate-600 transition-colors"
        >
          <span className="text-xs">{collapsed ? '→' : '←'}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all duration-200",
                selectedView === item.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
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
        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">System Online</span>
          </div>
          <div className="text-xs text-slate-500">
            Last sync: Just now
          </div>
        </div>
      )}
    </div>
  );
};
