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
import { MarineData } from '../../types';
import type { WaveChartData } from '../Charts/WaveChart';
import { OrcaQueryResult } from '../../services/orca';
import {
  mockWaveData, mockTideData, mockMarineData,
  mockSSTData, mockWindData,
  mockSparklineWave, mockSparklineWind, mockSparklineSST, mockSparklinePres,
} from '../../data/mockData';

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

// ── Stat card with sparkline ──────────────────────────────────────────────────
const StatCard = ({ label, value, unit, data, color }: {
  label: string; value: string; unit: string; data: number[]; color: string;
}) => (
  <div style={{
    backgroundColor: 'var(--orca-bg-surface)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
    minWidth: 0,
  }}>
    <span style={{ fontSize: '10px', color: 'var(--orca-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'ui-monospace, monospace' }}>
      {label}
    </span>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <span style={{ fontSize: '20px', color: 'var(--orca-text-primary)', fontFamily: 'ui-monospace, monospace', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: '11px', color: 'var(--orca-text-muted)', marginLeft: 3 }}>{unit}</span>
      </div>
      <DataSparkline data={data} width={72} height={26} color={color} />
    </div>
  </div>
);

// ── Tab types ─────────────────────────────────────────────────────────────────
type DataTab = 'overview' | 'waves' | 'tides' | 'sst';

// ── Data drawer ───────────────────────────────────────────────────────────────
const DataDrawer = ({
  open,
  onToggle,
  marineData,
  waveChartData,
}: {
  open: boolean;
  onToggle: () => void;
  marineData: MarineData;
  waveChartData: WaveChartData[];
}) => {
  const [tab, setTab] = useState<DataTab>('overview');

  const tabs: { id: DataTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'waves',    label: 'Waves' },
    { id: 'tides',    label: 'Tides' },
    { id: 'sst',      label: 'SST' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      zIndex: 20,
      backgroundColor: 'var(--orca-bg-secondary)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      height: open ? '300px' : '34px',
      transition: 'height 0.25s ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        height: 34,
        borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none',
        flexShrink: 0,
        padding: '0 8px',
      }}>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--orca-text-muted)',
            cursor: 'pointer',
            padding: '0 8px 0 4px',
            fontSize: '10px',
            fontFamily: 'ui-monospace, monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
          </svg>
          Data
        </button>

        {open && tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--orca-accent)' : '2px solid transparent',
              cursor: 'pointer',
              padding: '0 12px',
              height: '100%',
              fontSize: '11px',
              fontFamily: 'ui-monospace, monospace',
              color: tab === t.id ? 'var(--orca-accent)' : 'var(--orca-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
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
              {/* Stat cards */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StatCard label="Wave Ht" value={marineData.waveHeight != null ? marineData.waveHeight.toFixed(1) : '2.3'} unit="m"    data={mockSparklineWave} color="var(--orca-accent)" />
                <StatCard label="Wind"    value={marineData.windSpeed   != null ? marineData.windSpeed.toFixed(0)   : '19'} unit="km/h" data={mockSparklineWind} color="var(--orca-accent-blue)" />
                <StatCard label="SST"     value={marineData.sst         != null ? marineData.sst.toFixed(1)         : '27'} unit="°C"   data={mockSparklineSST}  color="#fb7185" />
                <StatCard label="Press"   value={marineData.pressure    != null ? String(marineData.pressure)       : '1012'} unit="hPa" data={mockSparklinePres} color="#a78bfa" />
              </div>

              {/* Marine card + WindRose */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MarineDataCard data={marineData} compact={true} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <WindRose
                    windSpeed={marineData.windSpeed ?? mockWindData.windSpeed}
                    windDirection={marineData.windDirection ?? mockWindData.windDirection}
                    gustSpeed={mockWindData.gustSpeed}
                    size={96}
                  />
                  <span style={{ fontSize: '9px', color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
                    WIND ROSE
                  </span>
                </div>
              </div>
            </div>
          )}

          {tab === 'waves' && (
            <div style={{ height: '230px' }}>
              <WaveChart
                data={waveChartData.length > 0 ? waveChartData : mockWaveData}
                title="Wave Forecast (24h)"
                dangerThreshold={3}
              />
            </div>
          )}

          {tab === 'tides' && (
            <div style={{ height: '230px' }}>
              <TideChart data={mockTideData} title="Tide Predictions" />
            </div>
          )}

          {tab === 'sst' && (
            <SSTHeatmap data={mockSSTData} title="Sea Surface Temperature" />
          )}

        </div>
      )}
    </div>
  );
};

// ── Main layout ───────────────────────────────────────────────────────────────
const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [chatWidthPct, setChatWidthPct] = useState(42);
  const [isDragging, setIsDragging]     = useState(false);
  const [activeTab, setActiveTab]       = useState<'chat' | 'map'>('chat');
  const [isMobile, setIsMobile]         = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(true);

  // Live chart data — updated by marine API responses
  const [liveMarineData, setLiveMarineData] = useState<MarineData>(mockMarineData);
  const [liveWaveChart, setLiveWaveChart]   = useState<WaveChartData[]>(mockWaveData);

  const { viewport, setViewport, layers, toggleLayer, flyTo } = useMapSync();

  const handleMarineData = useCallback((result: OrcaQueryResult) => {
    if (result.marineData)   setLiveMarineData(result.marineData);
    if (result.waveChartData && result.waveChartData.length > 0) setLiveWaveChart(result.waveChartData);
    if (result.locationCoords) {
      flyTo(result.locationCoords.lat, result.locationCoords.lon, 8);
    }
  }, [flyTo]);

  const {
    sessions, activeId, messages, isStreaming, safetyAlerts,
    userLocation, setUserLocation,
    sendMessage, newSession, switchSession, deleteSession,
    dismissAlert,
  } = useChat({ onMarineData: handleMarineData });

  // Responsive breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Drag-to-resize
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const pct = (e.clientX / window.innerWidth) * 100;
      if (pct > 20 && pct < 75) setChatWidthPct(pct);
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
  }, [isDragging]);

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--orca-bg-primary)',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'var(--orca-text-primary)',
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        height: 44,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: 'var(--orca-bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontWeight: 700,
            color: 'var(--orca-accent)',
            fontSize: 16,
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.04em',
          }}>
            ORCA
          </span>
          <span style={{
            fontSize: 12,
            color: 'var(--orca-text-muted)',
          }}>
            Marine Ecosystem Intelligence
          </span>
          <span style={{
            fontSize: 10,
            padding: '2px 6px',
            border: '1px solid rgba(45,212,191,0.25)',
            color: 'var(--orca-accent)',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.04em',
          }}>
            LIVE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Mobile tab switch */}
          {isMobile && (
            <div style={{
              display: 'flex',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              {(['chat', 'map'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    background: activeTab === t ? 'var(--orca-bg-surface)' : 'none',
                    border: 'none',
                    color: activeTab === t ? 'var(--orca-text-primary)' : 'var(--orca-text-muted)',
                    padding: '4px 12px',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              backgroundColor: isStreaming ? 'var(--orca-warning)' : 'var(--orca-success)',
              animation: isStreaming ? 'pulse-subtle 1s infinite' : 'none',
            }} />
            <span style={{ fontSize: 10, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
              {isStreaming ? 'Fetching' : 'Ready'}
            </span>
          </div>

          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--orca-text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
          }}>
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        {!isMobile && (
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(o => !o)}
            sessions={sessions}
            activeId={activeId}
            onNewSession={newSession}
            onSwitchSession={switchSession}
            onDeleteSession={deleteSession}
          />
        )}

        {/* Chat panel */}
        {(!isMobile || activeTab === 'chat') && (
          <div style={{
            width: isMobile ? '100%' : chatWidthPct + '%',
            height: '100%',
            flexShrink: 0,
            display: 'flex',
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
        )}

        {/* Drag handle */}
        {!isMobile && (
          <div
            onMouseDown={() => setIsDragging(true)}
            style={{
              width: 4,
              backgroundColor: isDragging ? 'var(--orca-accent)' : 'rgba(255,255,255,0.05)',
              cursor: 'col-resize',
              flexShrink: 0,
              transition: 'background-color 0.15s',
            }}
          />
        )}

        {/* Map + data drawer */}
        {(!isMobile || activeTab === 'map') && (
          <div style={{
            flex: 1,
            height: '100%',
            position: 'relative',
            borderLeft: '1px solid rgba(255,255,255,0.05)',
            minWidth: 0,
          }}>
            {/* Map fills space above drawer */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: drawerOpen ? 300 : 34,
              transition: 'bottom 0.25s ease',
            }}>
              <MapPanel
                viewport={viewport}
                onViewportChange={setViewport}
                layers={layers}
                onToggleLayer={toggleLayer}
                onMapClick={(lat, lon) => {
                  setUserLocation({ lat, lon });
                  flyTo(lat, lon);
                }}
                marineData={liveMarineData}
              />
            </div>

            {/* Data drawer */}
            <DataDrawer
              open={drawerOpen}
              onToggle={() => setDrawerOpen(o => !o)}
              marineData={liveMarineData}
              waveChartData={liveWaveChart}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
