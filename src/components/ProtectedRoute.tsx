
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/auth/AuthPage';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
            <Shield className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div className="text-foreground text-xl font-medium">Loading Drishti...</div>
          <div className="text-muted-foreground text-sm mt-2">Initializing security systems</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};
