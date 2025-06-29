
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain } from 'lucide-react';

export const SituationalSummaries = () => {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGetSummary = async () => {
    if (!query.trim()) {
      return;
    }

    setIsGenerating(true);
    
    // Simulate summary generation
    setTimeout(() => {
      setIsGenerating(false);
      // Here you would handle the generated summary
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Situational Summary</h1>
            </div>
            <p className="text-gray-600 mb-8">Generate AI-powered situational summaries.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Query
                </label>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'What is the current situation at the main stage?'"
                  className="min-h-[120px] bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <Button
                onClick={handleGetSummary}
                disabled={isGenerating || !query.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
              >
                {isGenerating ? 'Generating...' : 'Get Summary'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
