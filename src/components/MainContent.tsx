
import React from 'react';
import { OverviewDashboard } from '@/components/views/OverviewDashboard';
import { VideoFeeds } from '@/components/views/VideoFeeds';
import { CrowdAnalysis } from '@/components/views/CrowdAnalysis';
import { IncidentManagement } from '@/components/views/IncidentManagement';
import { AISearch } from '@/components/views/AISearch';
import { Settings } from '@/components/views/Settings';

interface MainContentProps {
  selectedView: string;
}

export const MainContent = ({ selectedView }: MainContentProps) => {
  const renderView = () => {
    switch (selectedView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'feeds':
        return <VideoFeeds />;
      case 'crowd':
        return <CrowdAnalysis />;
      case 'incidents':
        return <IncidentManagement />;
      case 'search':
        return <AISearch />;
      case 'settings':
        return <Settings />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {renderView()}
    </div>
  );
};
