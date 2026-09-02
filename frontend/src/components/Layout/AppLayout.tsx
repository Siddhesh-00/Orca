import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatPanel from '../Chat/ChatPanel';
import MapPanel from '../Map/MapPanel';
import { useChat } from '../../hooks/useChat';
import { useMapSync } from '../../hooks/useMapSync';

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'map'>('chat');
  const [isMobile, setIsMobile] = useState(false);

  const { messages, isStreaming, safetyAlerts, sendMessage, dismissAlert, setUserLocation } = useChat();
  const { viewport, setViewport, layers, toggleLayer, flyTo } = useMapSync();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--orca-bg-primary)] overflow-hidden font-sans text-[var(--orca-text-primary)]">
      {/* Header */}
      <header className="h-12 border-b border-[var(--orca-border)] bg-[var(--orca-bg-secondary)] flex items-center justify-between px-4 shrink-0 relative overflow-hidden">
        {/* Subtle wave background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 10 Q 25 0, 50 10 T 100 10\' stroke=\'%23ffffff\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', animation: 'wave 20s linear infinite' }}></div>
        
        <div className="flex items-center gap-3 z-10">
          <span className="font-bold tracking-tight text-[var(--orca-accent)] text-lg">ORCA</span>
          <span className="text-[var(--orca-text-muted)] text-sm hidden sm:inline">Marine Ecosystem Intelligence</span>
        </div>
        
        <div className="flex items-center gap-4 z-10">
          {isMobile && (
            <div className="flex bg-[var(--orca-bg-surface)] p-0.5 rounded border border-[var(--orca-border)]">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 text-xs rounded transition-colors ${activeTab === 'chat' ? 'bg-[var(--orca-bg-tertiary)] text-[var(--orca-text-primary)]' : 'text-[var(--orca-text-muted)]'}`}
              >
                Chat
              </button>
              <button 
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1 text-xs rounded transition-colors ${activeTab === 'map' ? 'bg-[var(--orca-bg-tertiary)] text-[var(--orca-text-primary)]' : 'text-[var(--orca-text-muted)]'}`}
              >
                Map
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--orca-success)]"></div>
            <span className="text-[10px] text-[var(--orca-text-muted)] hidden sm:inline">Connected</span>
          </div>
          
          <button className="text-[var(--orca-text-secondary)] hover:text-[var(--orca-text-primary)] transition-colors">
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!isMobile && <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />}
        
        {(!isMobile || activeTab === 'chat') && (
          <div style={{ width: isMobile ? '100%' : `${chatWidth}%` }} className="h-full flex flex-col shrink-0">
            <ChatPanel 
              messages={messages} 
              onSendMessage={sendMessage} 
              isStreaming={isStreaming} 
              safetyAlerts={safetyAlerts}
              onDismissAlert={dismissAlert}
            />
          </div>
        )}

        {!isMobile && (
          <div 
            className="w-1 bg-[var(--orca-border)] hover:bg-[var(--orca-accent)] cursor-col-resize transition-colors z-10"
            onMouseDown={handleMouseDown}
          />
        )}

        {(!isMobile || activeTab === 'map') && (
          <div style={{ width: isMobile ? '100%' : `${100 - chatWidth}%` }} className="h-full bg-[var(--orca-bg-primary)] flex-1 relative border-l border-[var(--orca-border)]">
            <MapPanel 
              viewport={viewport} 
              onViewportChange={setViewport} 
              layers={layers} 
              onToggleLayer={toggleLayer} 
              onMapClick={(lat, lon) => { 
                setUserLocation({lat, lon}); 
                flyTo(lat, lon); 
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
