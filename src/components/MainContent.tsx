
import React from 'react';
import { VideoFeeds } from '@/components/views/VideoFeeds';
import { CrowdAnalysis } from '@/components/views/CrowdAnalysis';
import { IncidentManagement } from '@/components/views/IncidentManagement';
import { AISearch } from '@/components/views/AISearch';
import { Settings } from '@/components/views/Settings';
import { BottleneckAnalysis } from '@/components/views/BottleneckAnalysis';
import { SituationalSummaries } from '@/components/views/SituationalSummaries';
import { AnomalyDetection } from '@/components/views/AnomalyDetection';
import { LostAndFound } from '@/components/views/LostAndFound';
import { MobileStaffApp } from '@/components/MobileStaffApp';

interface MainContentProps {
  selectedView: string;
}

export const MainContent = ({ selectedView }: MainContentProps) => {
  const renderView = () => {
    switch (selectedView) {
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
      case 'bottleneck':
        return <BottleneckAnalysis />;
      case 'summaries':
        return <SituationalSummaries />;
      case 'anomaly':
        return <AnomalyDetection />;
      case 'lost-found':
        return <LostAndFound />;
      case 'mobile':
        return <MobileStaffApp />;
      default:
        return <VideoFeeds />;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {renderView()}
    </div>
  );
};
