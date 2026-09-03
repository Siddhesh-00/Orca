import React from 'react';
import { TideData } from '../../types';

interface TideTableProps {
  data: TideData[];
  title?: string;
}

function hourLabel(time: string): string {
  // Parse "HH:MM" and determine AM/PM
  const [h] = time.split(':').map(Number);
  return h < 12 ? 'AM' : 'PM';
}

const UpArrow = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--orca-accent)" strokeWidth="2.5">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
const DownArrow = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--orca-accent-blue)" strokeWidth="2.5">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

export const TideTable: React.FC<TideTableProps> = ({ data, title }) => {
  const extremes = data.filter(d => d.type === 'high' || d.type === 'low');
  const maxH = Math.max(...data.map(d => d.height));

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <div style={{
          fontSize: 10, color: 'var(--orca-text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.08em', fontFamily: 'ui-monospace, monospace',
          marginBottom: 10,
        }}>
          {title}
        </div>
      )}

      {/* High/Low summary */}
      {extremes.length > 0 && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap',
        }}>
          {extremes.map((e, i) => (
            <div
              key={i}
              className="anim-scale-in"
              style={{
                padding: '7px 12px',
                border: '1px solid ' + (e.type === 'high' ? 'rgba(45,212,191,0.25)' : 'rgba(59,130,246,0.25)'),
                backgroundColor: e.type === 'high' ? 'rgba(45,212,191,0.05)' : 'rgba(59,130,246,0.05)',
                animationDelay: i * 50 + 'ms',
                animationFillMode: 'both',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                {e.type === 'high' ? <UpArrow /> : <DownArrow />}
                <span style={{
                  fontSize: 9, color: e.type === 'high' ? 'var(--orca-accent)' : 'var(--orca-accent-blue)',
                  fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {e.type === 'high' ? 'High Water' : 'Low Water'}
                </span>
              </div>
              <span style={{ fontSize: 18, color: 'var(--orca-text-primary)', fontFamily: 'ui-monospace, monospace', lineHeight: 1 }}>
                {e.height.toFixed(1)}
              </span>
              <span style={{ fontSize: 10, color: 'var(--orca-text-muted)', marginLeft: 2 }}>m</span>
              <div style={{ fontSize: 10, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace', marginTop: 2 }}>
                {e.time} {hourLabel(e.time)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hour-by-hour bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
        {data.slice(0, 24).map((d, i) => {
          const pct = maxH > 0 ? d.height / maxH : 0;
          const isExtreme = d.type === 'high' || d.type === 'low';
          return (
            <div
              key={i}
              title={d.time + ': ' + d.height.toFixed(2) + 'm'}
              style={{
                flex: 1,
                height: Math.max(4, pct * 56) + 'px',
                backgroundColor: isExtreme
                  ? (d.type === 'high' ? 'var(--orca-accent)' : 'var(--orca-accent-blue)')
                  : 'rgba(45,212,191,0.3)',
                transition: 'height 0.5s ease',
                cursor: 'default',
                minWidth: 0,
              }}
            />
          );
        })}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 9, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace', marginTop: 3,
      }}>
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
};

export default TideTable;
