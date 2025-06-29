
import React from 'react';
import { VideoFeeds } from '@/components/views/VideoFeeds';
import { CrowdAnalysis } from '@/components/views/CrowdAnalysis';
import { IncidentManagement } from '@/components/views/IncidentManagement';
import { Settings } from '@/components/views/Settings';
import { BottleneckAnalysis } from '@/components/views/BottleneckAnalysis';
import { AnomalyDetection } from '@/components/views/AnomalyDetection';
import { LostAndFound } from '@/components/views/LostAndFound';
import { MobileStaffApp } from '@/components/MobileStaffApp';
import { OverviewDashboard } from '@/components/views/OverviewDashboard';
import { SituationalSummaries } from '@/components/views/SituationalSummaries';

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
      case 'summaries':
        return <SituationalSummaries />;
      case 'settings':
        return <Settings />;
      case 'bottleneck':
        return <BottleneckAnalysis />;
      case 'anomaly':
        return <AnomalyDetection />;
      case 'lost-found':
        return <LostAndFound />;
      case 'mobile':
        return <MobileStaffApp />;
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
