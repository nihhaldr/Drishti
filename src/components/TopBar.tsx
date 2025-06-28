
import React, { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const TopBar = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Drishti AI anything... (e.g., 'Show me crowd density at Gate 3')"
          className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Emergency Button */}
        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
          Emergency Alert
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
            <Bell size={20} />
          </Button>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">3</span>
          </div>
        </div>

        {/* User Profile */}
        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
          <User size={20} />
        </Button>
      </div>
    </div>
  );
};
