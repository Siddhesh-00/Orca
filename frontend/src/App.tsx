import React from 'react';
import AppLayout from './components/Layout/AppLayout';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--orca-bg-primary)] text-[var(--orca-text-primary)]">
      <AppLayout />
    </div>
  );
};

export default App;
