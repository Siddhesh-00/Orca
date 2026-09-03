import React from 'react';

interface StatusBarProps {
  location?: string;
  coords?: { lat: number; lon: number };
  isStreaming: boolean;
  dataSource?: string;
  lastUpdated?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  location,
  coords,
  isStreaming,
  dataSource = 'Open-Meteo Marine',
  lastUpdated,
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '3px 14px',
    backgroundColor: 'var(--orca-bg-secondary)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    fontSize: 10,
    color: 'var(--orca-text-muted)',
    fontFamily: 'ui-monospace, monospace',
    flexShrink: 0,
    flexWrap: 'wrap',
    rowGap: 0,
  }}>
    {/* Connection status */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        backgroundColor: isStreaming ? 'var(--orca-warning)' : 'var(--orca-success)',
        animation: isStreaming ? 'pulse-subtle 1s infinite' : 'none',
      }} />
      <span>{isStreaming ? 'Fetching' : 'Ready'}</span>
    </div>

    {/* Separator */}
    <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>

    {/* Data source */}
    <span>Source: {dataSource}</span>

    {/* Location */}
    {location && (
      <>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span style={{ color: 'var(--orca-text-secondary)' }}>{location}</span>
      </>
    )}
    {coords && (
      <span>{coords.lat.toFixed(3)}N {coords.lon.toFixed(3)}E</span>
    )}

    {/* Spacer */}
    <span style={{ flex: 1 }} />

    {/* Last updated */}
    {lastUpdated && (
      <span>Updated {lastUpdated}</span>
    )}
  </div>
);

export default StatusBar;
