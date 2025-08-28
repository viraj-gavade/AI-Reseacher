import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const AppLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size={40} className="mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we set things up</p>
        </div>
      </div>
    </div>
  );
};

export default AppLoading;
