
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { MainContent } from '@/components/MainContent';
import { AlertPanel } from '@/components/AlertPanel';
import { useRouteState } from '@/hooks/useRouteState';

export const CommandDashboard = () => {
  const { currentRoute, updateRoute } = useRouteState();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar 
        selectedView={currentRoute} 
        setSelectedView={updateRoute}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <MainContent selectedView={currentRoute} />
          <AlertPanel />
        </div>
      </div>
    </div>
  );
};
