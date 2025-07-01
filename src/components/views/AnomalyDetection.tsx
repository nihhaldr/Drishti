
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DetectionResult {
  hasAnomaly: boolean;
  confidence: number;
  description: string;
  recommendations: string[];
}

export const AnomalyDetection = () => {
  const [visualFile, setVisualFile] = useState<File | null>(null);
  const [textualDescription, setTextualDescription] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVisualFile(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleDetectAnomaly = async () => {
    if (!geminiApiKey.trim()) {
      toast.error('Please enter your Gemini API key');
      return;
    }

    if (!visualFile && !textualDescription.trim()) {
      toast.error('Please provide either an image or text description');
      return;
    }

    setIsDetecting(true);
    
    try {
      let prompt = `Analyze the following for security anomalies or potential threats in a crowd management context. 
      Look for unusual behavior, overcrowding, potential safety hazards, or security concerns.
      
      Respond in JSON format with:
      {
        "hasAnomaly": boolean,
        "confidence": number (0-100),
        "description": "detailed description of findings",
        "recommendations": ["list", "of", "recommendations"]
      }`;

      if (textualDescription.trim()) {
        prompt += `\n\nText Description: ${textualDescription}`;
      }

      const requestBody: any = {
        contents: [{
          parts: []
        }]
      };

      if (visualFile) {
        const base64Data = await convertFileToBase64(visualFile);
        requestBody.contents[0].parts.push({
          inline_data: {
            mime_type: visualFile.type,
            data: base64Data
          }
        });
      }

      requestBody.contents[0].parts.push({
        text: prompt
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      
      try {
        const result = JSON.parse(responseText);
        setDetectionResult(result);
        
        if (result.hasAnomaly) {
          toast.error(`Anomaly detected with ${result.confidence}% confidence`);
        } else {
          toast.success('No anomalies detected');
        }
      } catch (parseError) {
        // Fallback for non-JSON responses
        setDetectionResult({
          hasAnomaly: responseText.toLowerCase().includes('anomaly') || responseText.toLowerCase().includes('concern'),
          confidence: 75,
          description: responseText,
          recommendations: ['Review the analysis and take appropriate action']
        });
        toast.success('Analysis completed');
      }
      
    } catch (error) {
      console.error('Error detecting anomaly:', error);
      toast.error('Failed to analyze data. Please check your API key and try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Anomaly Detection</h1>
            </div>
            <p className="text-gray-600 mb-8">Analyze visual and textual data for potential threats using Google Gemini AI.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Gemini API Key
                </label>
                <Input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Enter your Google Gemini API key"
                  className="bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Visual Input
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                  />
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-700">
                        {visualFile ? visualFile.name : 'Choose File - No file chosen'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Textual Description
                </label>
                <Textarea
                  value={textualDescription}
                  onChange={(e) => setTextualDescription(e.target.value)}
                  placeholder="e.g., 'Crowd at main stage seems agitated and pushing forward'"
                  className="min-h-[120px] bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <Button
                onClick={handleDetectAnomaly}
                disabled={isDetecting || !geminiApiKey.trim() || (!visualFile && !textualDescription.trim())}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
              >
                {isDetecting ? 'Analyzing...' : 'Detect Anomaly'}
              </Button>
            </div>
          </div>
        </Card>

        {detectionResult && (
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {detectionResult.hasAnomaly ? (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                <h3 className="text-lg font-semibold">
                  {detectionResult.hasAnomaly ? 'Anomaly Detected' : 'No Anomalies Found'}
                </h3>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {detectionResult.confidence}% confidence
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Analysis</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{detectionResult.description}</p>
                </div>

                {detectionResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {detectionResult.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
