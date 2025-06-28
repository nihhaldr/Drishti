
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { MainContent } from '@/components/MainContent';
import { AlertPanel } from '@/components/AlertPanel';

export const CommandDashboard = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar 
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <div className="flex-1 flex overflow-hidden">
          <MainContent selectedView={selectedView} />
          <AlertPanel />
        </div>
      </div>
    </div>
  );
};
