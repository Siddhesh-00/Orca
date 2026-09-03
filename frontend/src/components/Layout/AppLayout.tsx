import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import ChatPanel from '../Chat/ChatPanel';
import MapPanel from '../Map/MapPanel';
import { WaveChart } from '../Charts/WaveChart';
import { TideChart } from '../Charts/TideChart';
import { SSTHeatmap } from '../Charts/SSTHeatmap';
import { OceanOverview } from '../Charts/OceanOverview';
import { FishingZonePanel } from '../Widgets/FishingZonePanel';
import { TideTable } from '../Widgets/TideTable';
import StatusBar from '../Widgets/StatusBar';
import { useChat } from '../../hooks/useChat';
import { useMapSync } from '../../hooks/useMapSync';
import { MarineData } from '../../types';
import type { WaveChartData } from '../Charts/WaveChart';
import type { OrcaQueryResult } from '../../services/orca';
import {
  mockWaveData, mockTideData, mockMarineData, mockSSTData,
} from '../../data/mockData';

// ── Mobile breakpoint ──────────────────────────────────────────────────────────
const MOBILE_BP = 768;

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const MapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);
const DataIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

// Suppress unused import warnings for removed stat-card helpers
void mockWaveData; void mockTideData;
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);


// ── Data tab content (mobile) / Drawer content (desktop) ─────────────────────
type DataSubTab = 'overview' | 'waves' | 'tides' | 'sst' | 'pfz';

const DataContent: React.FC<{
  marineData: MarineData;
  waveChartData: WaveChartData[];
  locationName?: string;
}> = ({ marineData, waveChartData, locationName }) => {
  const [tab, setTab] = useState<DataSubTab>('overview');

  const tabs: { id: DataSubTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'waves',    label: 'Waves'    },
    { id: 'tides',    label: 'Tides'    },
    { id: 'sst',      label: 'SST'      },
    { id: 'pfz',      label: 'PFZ'      },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backgroundColor: 'var(--orca-bg-secondary)',
        flexShrink: 0,
        padding: '0 4px',
        overflowX: 'auto',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--orca-accent)' : '2px solid transparent',
              color: tab === t.id ? 'var(--orca-accent)' : 'var(--orca-text-muted)',
              padding: '8px 14px',
              fontSize: 11,
              fontFamily: 'ui-monospace, monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {tab === 'overview' && (
          <OceanOverview marineData={marineData} locationName={locationName} />
        )}

        {tab === 'waves' && (
          <div className="anim-fade-in">
            <div style={{ height: 220 }}>
              <WaveChart
                data={waveChartData.length > 0 ? waveChartData : mockWaveData}
                title="Wave Forecast (24h)"
                dangerThreshold={3}
              />
            </div>
          </div>
        )}

        {tab === 'tides' && (
          <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TideTable data={mockTideData} title="Tide Heights" />
            <div style={{ height: 200 }}>
              <TideChart data={mockTideData} title="Tide Curve" />
            </div>
          </div>
        )}

        {tab === 'sst' && (
          <div className="anim-fade-in">
            <SSTHeatmap data={mockSSTData} title="Sea Surface Temperature" />
          </div>
        )}

        {tab === 'pfz' && (
          <div className="anim-fade-in">
            <FishingZonePanel />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Desktop data drawer ───────────────────────────────────────────────────────

const DesktopDrawer: React.FC<{
  open: boolean;
  onToggle: () => void;
  marineData: MarineData;
  waveChartData: WaveChartData[];
  locationName?: string;
}> = ({ open, onToggle, marineData, waveChartData, locationName }) => (
  <div style={{
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    zIndex: 20,
    backgroundColor: 'var(--orca-bg-secondary)',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    height: open ? 320 : 32,
    transition: 'height 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }}>
    {/* Toggle handle */}
    <button
      onClick={onToggle}
      style={{
        height: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        background: 'none',
        border: 'none',
        borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none',
        color: 'var(--orca-text-muted)',
        cursor: 'pointer',
        fontSize: 10,
        fontFamily: 'ui-monospace, monospace',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        flexShrink: 0,
        width: '100%',
      }}
    >
      <svg
        width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
      <span>Data Panel</span>
      {!open && (
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>
          Click to expand
        </span>
      )}
    </button>

    {open && (
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DataContent
          marineData={marineData}
          waveChartData={waveChartData}
          locationName={locationName}
        />
      </div>
    )}
  </div>
);

// ── Mobile bottom nav ─────────────────────────────────────────────────────────

type MobileTab = 'chat' | 'map' | 'data';

const MobileBottomNav: React.FC<{
  activeTab: MobileTab;
  onChange: (t: MobileTab) => void;
}> = ({ activeTab, onChange }) => {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <ChatIcon /> },
    { id: 'map',  label: 'Map',  icon: <MapIcon  /> },
    { id: 'data', label: 'Data', icon: <DataIcon /> },
  ];
  return (
    <div style={{
      height: 56,
      display: 'flex',
      backgroundColor: 'var(--orca-bg-secondary)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      flexShrink: 0,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            borderTop: activeTab === t.id ? '2px solid var(--orca-accent)' : '2px solid transparent',
            color: activeTab === t.id ? 'var(--orca-accent)' : 'var(--orca-text-muted)',
            cursor: 'pointer',
            padding: '6px 0',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {t.icon}
          <span style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
};

// ── Header ────────────────────────────────────────────────────────────────────

const Header: React.FC<{ isStreaming: boolean }> = ({ isStreaming }) => (
  <header style={{
    height: 44,
    backgroundColor: 'var(--orca-bg-secondary)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        fontWeight: 700, color: 'var(--orca-accent)', fontSize: 16,
        fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em',
      }}>
        ORCA
      </span>
      <span style={{ fontSize: 11, color: 'var(--orca-text-muted)' }}>
        Marine Intelligence
      </span>
      <span style={{
        fontSize: 9, padding: '2px 5px',
        border: '1px solid rgba(45,212,191,0.3)',
        color: 'var(--orca-accent)',
        fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em',
      }}>
        LIVE
      </span>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Status dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          backgroundColor: isStreaming ? 'var(--orca-warning)' : 'var(--orca-success)',
          animation: isStreaming ? 'pulse-dot 1s infinite' : 'none',
        }} />
        <span style={{ fontSize: 10, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
          {isStreaming ? 'Fetching' : 'Ready'}
        </span>
      </div>
      <button style={{ background: 'none', border: 'none', color: 'var(--orca-text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}>
        <SettingsIcon />
      </button>
    </div>
  </header>
);

// ── Main layout ───────────────────────────────────────────────────────────────

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [chatWidthPct, setChatWidthPct] = useState(42);
  const [isDragging, setIsDragging]     = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(true);
  const [mobileTab, setMobileTab]       = useState<MobileTab>('chat');
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < MOBILE_BP);
  const [locationName, setLocationName] = useState<string | undefined>();
  const chatWidthRef = useRef(chatWidthPct);

  // Live data
  const [liveMarineData, setLiveMarineData] = useState<MarineData>(mockMarineData);
  const [liveWaveChart, setLiveWaveChart]   = useState<WaveChartData[]>(mockWaveData);

  const { viewport, setViewport, layers, toggleLayer, flyTo } = useMapSync();

  const handleMarineData = useCallback((result: OrcaQueryResult) => {
    if (result.marineData)                                        setLiveMarineData(result.marineData);
    if (result.waveChartData && result.waveChartData.length > 0) setLiveWaveChart(result.waveChartData);
    if (result.locationCoords)                                    flyTo(result.locationCoords.lat, result.locationCoords.lon, 8);
    if (result.locationName)                                      setLocationName(result.locationName);
  }, [flyTo]);

  const {
    sessions, activeId, messages, isStreaming,
    safetyAlerts, userLocation, setUserLocation,
    sendMessage, newSession, switchSession, deleteSession, dismissAlert,
  } = useChat({ onMarineData: handleMarineData });

  // Responsive listener
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Drag-to-resize (desktop only)
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      e.preventDefault();
      const sidebarWidth = sidebarOpen ? 248 : 44;
      const availableWidth = window.innerWidth - sidebarWidth;
      const chatPx = e.clientX - sidebarWidth;
      const pct = (chatPx / availableWidth) * 100;
      if (pct > 20 && pct < 78) {
        chatWidthRef.current = pct;
        setChatWidthPct(pct);
      }
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, sidebarOpen]);

  const handleMapClick = useCallback((lat: number, lon: number) => {
    setUserLocation({ lat, lon });
    flyTo(lat, lon);
  }, [flyTo, setUserLocation]);

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--orca-bg-primary)',
        overflow: 'hidden',
      }}>
        <Header isStreaming={isStreaming} />

        {/* Panel container */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Chat */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: mobileTab === 'chat' ? 'flex' : 'none',
            flexDirection: 'column',
          }}>
            <ChatPanel
              messages={messages}
              onSendMessage={sendMessage}
              isStreaming={isStreaming}
              safetyAlerts={safetyAlerts}
              onDismissAlert={dismissAlert}
              attachedLocation={userLocation}
              onAttachLocation={setUserLocation}
            />
          </div>

          {/* Map */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: mobileTab === 'map' ? 'block' : 'none',
          }}>
            <MapPanel
              viewport={viewport}
              onViewportChange={setViewport}
              layers={layers}
              onToggleLayer={toggleLayer}
              onMapClick={handleMapClick}
              marineData={liveMarineData}
            />
          </div>

          {/* Data */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: mobileTab === 'data' ? 'flex' : 'none',
            flexDirection: 'column',
            backgroundColor: 'var(--orca-bg-primary)',
            overflowY: 'auto',
          }}>
            <DataContent
              marineData={liveMarineData}
              waveChartData={liveWaveChart}
              locationName={locationName}
            />
          </div>
        </div>

        {/* Bottom nav */}
        <MobileBottomNav activeTab={mobileTab} onChange={setMobileTab} />
      </div>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--orca-bg-primary)',
      overflow: 'hidden',
    }}>
      <Header isStreaming={isStreaming} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
          sessions={sessions}
          activeId={activeId}
          onNewSession={newSession}
          onSwitchSession={switchSession}
          onDeleteSession={deleteSession}
        />

        {/* Chat column */}
        <div style={{
          width: chatWidthPct + '%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            isStreaming={isStreaming}
            safetyAlerts={safetyAlerts}
            onDismissAlert={dismissAlert}
            attachedLocation={userLocation}
            onAttachLocation={setUserLocation}
          />
          <StatusBar
            location={locationName}
            isStreaming={isStreaming}
            lastUpdated={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={() => setIsDragging(true)}
          style={{
            width: 4,
            backgroundColor: isDragging ? 'var(--orca-accent)' : 'rgba(255,255,255,0.05)',
            cursor: 'col-resize',
            flexShrink: 0,
            transition: 'background-color 0.15s',
            zIndex: 10,
          }}
        />

        {/* Map + drawer column */}
        <div style={{
          flex: 1,
          position: 'relative',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {/* Map — height adjusts based on drawer */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: drawerOpen ? 320 : 32,
            transition: 'bottom 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <MapPanel
              viewport={viewport}
              onViewportChange={setViewport}
              layers={layers}
              onToggleLayer={toggleLayer}
              onMapClick={handleMapClick}
              marineData={liveMarineData}
            />
          </div>

          {/* Data drawer */}
          <DesktopDrawer
            open={drawerOpen}
            onToggle={() => setDrawerOpen(o => !o)}
            marineData={liveMarineData}
            waveChartData={liveWaveChart}
            locationName={locationName}
          />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
