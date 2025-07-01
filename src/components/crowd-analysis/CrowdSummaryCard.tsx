
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CrowdSummaryCardProps {
  generatedSummary: string;
  showSummary: boolean;
  onToggleSummary: (show: boolean) => void;
}

export const CrowdSummaryCard = ({ 
  generatedSummary, 
  showSummary, 
  onToggleSummary 
}: CrowdSummaryCardProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Summary copied to clipboard');
  };

  if (!showSummary) {
    return (
      <div className="text-center">
        <Button 
          onClick={() => onToggleSummary(true)}
          variant="outline"
        >
          Show Analysis Summary
        </Button>
      </div>
    );
  }

  if (!generatedSummary) return null;

  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          <img 
            src="/lovable-uploads/a6d3920a-f84c-4a08-b2c5-313fc9bbf28b.png" 
            alt="Summary icon" 
            className="w-5 h-5"
          />
          Crowd Analysis Summary
        </h3>
        <Button 
          onClick={() => onToggleSummary(false)}
          variant="ghost"
          size="sm"
        >
          Hide
        </Button>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
          {generatedSummary}
        </pre>
      </div>
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={() => copyToClipboard(generatedSummary)}
          size="sm"
          variant="outline"
        >
          <FileText className="w-4 h-4 mr-2" />
          Copy Summary
        </Button>
      </div>
    </Card>
  );
};
