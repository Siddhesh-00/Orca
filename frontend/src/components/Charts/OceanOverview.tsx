import React, { useEffect, useRef, useState } from 'react';
import { MarineData } from '../../types';
import { OceanCanvas } from '../Charts/OceanCanvas';
import { SeaStateGauge } from '../Charts/SeaStateGauge';
import { WindRose } from '../Charts/WindRose';
import { DataSparkline } from '../Charts/DataSparkline';
import {
  mockSparklineWave, mockSparklineWind,
  mockSparklineSST, mockSparklinePres, mockWindData,
} from '../../data/mockData';

// ── Helpers ───────────────────────────────────────────────────────────────────

function compassDir(deg?: number): string {
  if (deg == null) return '--';
  const d = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return d[Math.round(deg / 22.5) % 16];
}

function safetyLevel(h: number): 'safe' | 'caution' | 'danger' {
  if (h >= 4)   return 'danger';
  if (h >= 2.5) return 'caution';
  return 'safe';
}

const LEVEL_COLORS = {
  safe:    { border: 'rgba(16,185,129,0.35)', bg: 'rgba(16,185,129,0.06)', text: '#10b981', glow: '#10b981' },
  caution: { border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.06)', text: '#f59e0b', glow: '#f59e0b' },
  danger:  { border: 'rgba(239,68,68,0.4)',   bg: 'rgba(239,68,68,0.07)',  text: '#ef4444', glow: '#ef4444' },
};

// ── Animated count-up number ──────────────────────────────────────────────────

function useCountUp(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (Math.abs(to - from) < 0.05) { setDisplay(to); return; }
    startRef.current = performance.now();

    const animate = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      // Ease out
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
      else { prevRef.current = to; setDisplay(to); }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

// ── Reactive stat card ────────────────────────────────────────────────────────

interface ReactiveCardProps {
  label: string;
  value: number;
  decimals?: number;
  unit: string;
  data: number[];
  color: string;
  /** 0–1 intensity of wave-sync pulse */
  pulseIntensity?: number;
  highlight?: boolean;
}

const ReactiveCard: React.FC<ReactiveCardProps> = ({
  label, value, decimals = 1, unit, data, color, pulseIntensity = 0, highlight,
}) => {
  const animated = useCountUp(value);
  const cardRef = useRef<HTMLDivElement>(null);

  // Wave-reactive border glow
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !highlight) return;
    const alpha = 0.15 + pulseIntensity * 0.35;
    el.style.borderColor = color.replace(')', `, ${alpha})`).replace('var', 'rgba') || `rgba(45,212,191,${alpha})`;
  }, [pulseIntensity, color, highlight]);

  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: highlight ? `rgba(45,212,191,0.04)` : 'var(--orca-bg-surface)',
        border: '1px solid ' + (highlight ? `rgba(45,212,191,0.2)` : 'rgba(255,255,255,0.06)'),
        padding: '12px 14px',
        flex: '1 1 130px',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        transition: 'border-color 0.4s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = highlight ? 'rgba(45,212,191,0.04)' : 'var(--orca-bg-surface)';
      }}
    >
      {/* Shimmer on update */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.4,
        animation: 'shimmer 3s infinite',
      }} />

      <span style={{
        fontSize: 9, color: 'var(--orca-text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        fontFamily: 'ui-monospace, monospace',
      }}>
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
        <div>
          <span style={{
            fontSize: 22, color: 'var(--orca-text-primary)',
            fontFamily: 'ui-monospace, monospace', lineHeight: 1,
            fontWeight: 600,
          }}>
            {animated.toFixed(decimals)}
          </span>
          <span style={{ fontSize: 10, color: 'var(--orca-text-muted)', marginLeft: 3 }}>{unit}</span>
        </div>
        <DataSparkline data={data} width={60} height={22} color={color} />
      </div>
    </div>
  );
};

// ── Inline metric row ─────────────────────────────────────────────────────────

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <span style={{ fontSize: 10, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
    <span style={{ fontSize: 11, color: 'var(--orca-text-primary)', fontFamily: 'ui-monospace, monospace' }}>
      {value}
    </span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

interface OceanOverviewProps {
  marineData: MarineData;
  locationName?: string;
}

export const OceanOverview: React.FC<OceanOverviewProps> = ({ marineData, locationName }) => {
  const waveH    = marineData.waveHeight   ?? 2.3;
  const waveP    = marineData.wavePeriod   ?? 10;
  const waveDir  = marineData.waveDirection ?? 225;
  const windSpd  = marineData.windSpeed    ?? 18;
  const windDir  = marineData.windDirection ?? 240;
  const sst      = marineData.sst          ?? 27.4;
  const pressure = marineData.pressure     ?? 1012;
  const swellH   = marineData.swellHeight  ?? 1.8;
  const curSpd   = marineData.currentSpeed ?? 0.8;
  const vis      = marineData.visibility   ?? 12;

  const level  = safetyLevel(waveH);
  const lColor = LEVEL_COLORS[level];

  // Wave-sync pulse: oscillates at 1/wavePeriod Hz
  const pulseRef = useRef(0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      pulseRef.current += 0.05;
      const v = (Math.sin(pulseRef.current * (2 * Math.PI / waveP) * 3) + 1) / 2;
      setPulse(v);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [waveP]);

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Safety banner ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        backgroundColor: lColor.bg,
        border: '1px solid ' + lColor.border,
        animation: level === 'danger' ? 'borderGlow 2s infinite' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: lColor.glow,
            animation: level !== 'safe' ? 'pulse-dot 1.5s infinite' : 'none',
          }} />
          <span style={{ fontSize: 10, color: lColor.text, fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {level === 'safe' ? 'Conditions Favorable' : level === 'caution' ? 'Small Craft Advisory' : 'Severe Sea State — Danger'}
          </span>
        </div>
        {locationName && (
          <span style={{ fontSize: 10, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
            {locationName}
          </span>
        )}
      </div>

      {/* ── Ocean canvas ──────────────────────────────────────────────────── */}
      <div style={{
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <OceanCanvas
          waveHeight={waveH}
          wavePeriod={waveP}
          waveDirection={waveDir}
          windSpeed={windSpd}
          sst={sst}
          height={180}
          interactive={true}
        />
        {/* Overlay: location badge */}
        {locationName && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            fontSize: 9, color: 'rgba(45,212,191,0.6)',
            fontFamily: 'ui-monospace, monospace',
            padding: '2px 7px',
            border: '1px solid rgba(45,212,191,0.2)',
            backgroundColor: 'rgba(10,22,40,0.7)',
          }}>
            {locationName.toUpperCase()}
          </div>
        )}
      </div>

      {/* ── Reactive stat cards ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <ReactiveCard label="Wave Ht"  value={waveH}    decimals={1} unit="m"    data={mockSparklineWave} color="var(--orca-accent)"      pulseIntensity={pulse} highlight />
        <ReactiveCard label="Wind"     value={windSpd}   decimals={0} unit="km/h" data={mockSparklineWind} color="var(--orca-accent-blue)" pulseIntensity={pulse * 0.6} />
        <ReactiveCard label="SST"      value={sst}       decimals={1} unit="°C"   data={mockSparklineSST}  color="#fb7185"                pulseIntensity={pulse * 0.4} />
        <ReactiveCard label="Pressure" value={pressure}  decimals={0} unit="hPa"  data={mockSparklinePres} color="#a78bfa"                pulseIntensity={pulse * 0.3} />
      </div>

      {/* ── Gauge row ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Sea state gauge */}
        <div style={{
          border: '1px solid rgba(255,255,255,0.07)',
          backgroundColor: 'var(--orca-bg-surface)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          flex: '0 0 auto',
        }}>
          <div style={{ fontSize: 9, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Sea State
          </div>
          <SeaStateGauge waveHeight={waveH} windSpeed={windSpd} size={120} />
        </div>

        {/* Wind rose */}
        <div style={{
          border: '1px solid rgba(255,255,255,0.07)',
          backgroundColor: 'var(--orca-bg-surface)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          flex: '0 0 auto',
        }}>
          <div style={{ fontSize: 9, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Wind Rose
          </div>
          <WindRose
            windSpeed={windSpd}
            windDirection={windDir}
            gustSpeed={mockWindData.gustSpeed}
            size={120}
          />
        </div>

        {/* Detailed metrics */}
        <div style={{
          flex: 1,
          minWidth: 160,
          border: '1px solid rgba(255,255,255,0.07)',
          backgroundColor: 'var(--orca-bg-surface)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}>
          <div style={{ fontSize: 9, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Conditions Detail
          </div>
          <MetricRow label="Wave Period"  value={waveP.toFixed(0) + ' s'} />
          <MetricRow label="Wave Dir"     value={waveDir.toFixed(0) + '° ' + compassDir(waveDir)} />
          <MetricRow label="Swell Ht"     value={swellH.toFixed(1) + ' m'} />
          <MetricRow label="Current"      value={curSpd.toFixed(2) + ' m/s'} />
          <MetricRow label="Visibility"   value={vis.toFixed(1) + ' km'} />
          <MetricRow label="Wind Dir"     value={windDir.toFixed(0) + '° ' + compassDir(windDir)} />
          <MetricRow label="Atm Pressure" value={pressure + ' hPa'} />
          <MetricRow label="SST"          value={sst.toFixed(1) + ' °C'} />
        </div>
      </div>

      {/* Footer note */}
      <div style={{
        fontSize: 9, color: 'var(--orca-text-muted)',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex', justifyContent: 'space-between',
        borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6,
      }}>
        <span>Source: Open-Meteo Marine API</span>
        <span>Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};

export default OceanOverview;
