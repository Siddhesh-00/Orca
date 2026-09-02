import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatPanel from '../Chat/ChatPanel';
import MapPanel from '../Map/MapPanel';
import { WaveChart } from '../Charts/WaveChart';
import { TideChart } from '../Charts/TideChart';
import { WindRose } from '../Charts/WindRose';
import { MarineDataCard } from '../Charts/MarineDataCard';
import { SSTHeatmap } from '../Charts/SSTHeatmap';
import { DataSparkline } from '../Charts/DataSparkline';
import { useChat } from '../../hooks/useChat';
import { useMapSync } from '../../hooks/useMapSync';
import {
  mockWaveData,
  mockTideData,
  mockMarineData,
  mockSSTData,
  mockWindData,
  mockSparklineWave,
  mockSparklineWind,
  mockSparklineSST,
  mockSparklinePres,
} from '../../data/mockData';

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

type ChartTab = 'overview' | 'waves' | 'tides' | 'sst';

// ── Mini stat card with sparkline ─────────────────────────────────────────────
const StatCard = ({ label, value, unit, data, color }: {
  label: string; value: string; unit: string; data: number[]; color: string;
}) => (
  <div style={{
    backgroundColor: 'var(--orca-bg-surface)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
    flex: 1,
  }}>
    <span style={{ fontSize: '10px', color: 'var(--orca-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'ui-monospace, monospace' }}>
      {label}
    </span>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <span style={{ fontSize: '22px', color: 'var(--orca-text-primary)', fontFamily: 'ui-monospace, monospace', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: '11px', color: 'var(--orca-text-muted)', marginLeft: 4 }}>{unit}</span>
      </div>
      <DataSparkline data={data} width={80} height={28} color={color} />
    </div>
  </div>
);

// ── Chart panel bottom drawer ─────────────────────────────────────────────────
const DataDrawer = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => {
  const [tab, setTab] = useState<ChartTab>('overview');

  const tabs: { id: ChartTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'waves',    label: 'Waves' },
    { id: 'tides',    label: 'Tides' },
    { id: 'sst',      label: 'SST Map' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      backgroundColor: 'var(--orca-bg-secondary)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      transition: 'height 0.3s ease',
      height: open ? '320px' : '36px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Tab bar / toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '0 12px',
        height: '36px',
        flexShrink: 0,
        borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none',
        cursor: 'default',
      }}>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--orca-text-muted)',
            cursor: 'pointer',
            padding: '0 6px 0 0',
            display: 'flex',
            alignItems: 'center',
            fontSize: '11px',
            gap: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={open ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'} />
          </svg>
          DATA
        </button>
        {open && tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              fontSize: '11px',
              fontFamily: 'ui-monospace, monospace',
              color: tab === t.id ? 'var(--orca-accent)' : 'var(--orca-text-muted)',
              borderBottom: tab === t.id ? '2px solid var(--orca-accent)' : '2px solid transparent',
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {open && (
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 16px' }}>

          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Stat cards row */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <StatCard label="Wave Ht" value="2.3" unit="m"   data={mockSparklineWave} color="var(--orca-accent)" />
                <StatCard label="Wind"    value="18.6" unit="km/h" data={mockSparklineWind} color="var(--orca-accent-blue)" />
                <StatCard label="SST"     value="27.4" unit="°C"  data={mockSparklineSST}  color="#fb7185" />
                <StatCard label="Pressure" value="1012" unit="hPa" data={mockSparklinePres} color="#a78bfa" />
              </div>

              {/* Marine data card + wind rose */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MarineDataCard data={mockMarineData} compact={true} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <WindRose
                    windSpeed={mockWindData.windSpeed}
                    windDirection={mockWindData.windDirection}
                    gustSpeed={mockWindData.gustSpeed}
                    size={100}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
                    WIND
                  </span>
                </div>
              </div>
            </div>
          )}

          {tab === 'waves' && (
            <div style={{ height: '230px' }}>
              <WaveChart data={mockWaveData} title="24-Hour Wave Forecast" dangerThreshold={3} />
            </div>
          )}

          {tab === 'tides' && (
            <div style={{ height: '230px' }}>
              <TideChart data={mockTideData} title="Tide Schedule — Mumbai (JNPT)" />
            </div>
          )}

          {tab === 'sst' && (
            <SSTHeatmap data={mockSSTData} title="Sea Surface Temperature — Arabian Sea" />
          )}

        </div>
      )}
    </div>
  );
};

// ── Main layout ───────────────────────────────────────────────────────────────
const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'map'>('chat');
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

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
      if (newWidth > 20 && newWidth < 80) setChatWidth(newWidth);
    };
    const handleMouseUp = () => setIsDragging(false);

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
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 10 Q 25 0, 50 10 T 100 10\' stroke=\'%23ffffff\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', animation: 'wave 20s linear infinite' }}></div>

        <div className="flex items-center gap-3 z-10">
          <span className="font-bold tracking-tight text-[var(--orca-accent)] text-lg">ORCA</span>
          <span className="text-[var(--orca-text-muted)] text-sm hidden sm:inline">Marine Ecosystem Intelligence</span>
          <span style={{
            fontSize: '10px',
            padding: '2px 7px',
            borderRadius: '3px',
            backgroundColor: 'rgba(45,212,191,0.12)',
            color: 'var(--orca-accent)',
            fontFamily: 'ui-monospace, monospace',
            border: '1px solid rgba(45,212,191,0.2)',
          }}>
            DEMO
          </span>
        </div>

        <div className="flex items-center gap-4 z-10">
          {isMobile && (
            <div className="flex bg-[var(--orca-bg-surface)] p-0.5 rounded border border-[var(--orca-border)]">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 text-xs rounded transition-colors ${activeTab === 'chat' ? 'bg-[var(--orca-bg-tertiary)] text-[var(--orca-text-primary)]' : 'text-[var(--orca-text-muted)]'}`}
              >Chat</button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1 text-xs rounded transition-colors ${activeTab === 'map' ? 'bg-[var(--orca-bg-tertiary)] text-[var(--orca-text-primary)]' : 'text-[var(--orca-text-muted)]'}`}
              >Map</button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--orca-warning)]" style={{ animation: 'pulse-subtle 2s ease-in-out infinite' }}></div>
            <span className="text-[10px] text-[var(--orca-text-muted)] hidden sm:inline">Demo Mode</span>
          </div>

          <button className="text-[var(--orca-text-secondary)] hover:text-[var(--orca-text-primary)] transition-colors">
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!isMobile && <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />}

        {/* Chat column */}
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

        {/* Drag handle */}
        {!isMobile && (
          <div
            className="w-1 bg-[var(--orca-border)] hover:bg-[var(--orca-accent)] cursor-col-resize transition-colors z-10"
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Map + Data Drawer column */}
        {(!isMobile || activeTab === 'map') && (
          <div
            style={{ width: isMobile ? '100%' : `${100 - chatWidth}%`, position: 'relative' }}
            className="h-full bg-[var(--orca-bg-primary)] flex-1 border-l border-[var(--orca-border)]"
          >
            <div style={{ position: 'absolute', inset: 0, bottom: drawerOpen ? '320px' : '36px', transition: 'bottom 0.3s ease' }}>
              <MapPanel
                viewport={viewport}
                onViewportChange={setViewport}
                layers={layers}
                onToggleLayer={toggleLayer}
                onMapClick={(lat, lon) => {
                  setUserLocation({ lat, lon });
                  flyTo(lat, lon);
                }}
              />
            </div>

            <DataDrawer open={drawerOpen} onToggle={() => setDrawerOpen(o => !o)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
