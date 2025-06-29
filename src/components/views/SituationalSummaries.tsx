
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';

export const SituationalSummaries = () => {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGetSummary = async () => {
    if (!query.trim()) return;

    setIsGenerating(true);
    
    // Simulate AI summary generation
    setTimeout(() => {
      setIsGenerating(false);
      // Here you would handle the summary results
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Situational Summary</h1>
            </div>
            <p className="text-gray-600 mb-8">Query the AI for a real-time situation summary.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Query
                </label>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'What's the status of the main entrance?'"
                  className="min-h-[120px] bg-green-50 border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>

              <Button
                onClick={handleGetSummary}
                disabled={isGenerating || !query.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
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
