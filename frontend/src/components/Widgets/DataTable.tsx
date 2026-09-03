import React from 'react';

interface DataRow {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

interface DataTableProps {
  rows: DataRow[];
  title?: string;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ rows, title, className }) => (
  <div className={className} style={{ width: '100%' }}>
    {title && (
      <div style={{
        fontSize: 10,
        color: 'var(--orca-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontFamily: 'ui-monospace, monospace',
        padding: '0 0 8px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        marginBottom: 4,
      }}>
        {title}
      </div>
    )}
    {rows.map((row, i) => (
      <div
        key={i}
        className="anim-slide-up"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '5px 0',
          borderBottom: '1px solid rgba(255,255,255,0.035)',
          animationDelay: i * 40 + 'ms',
          animationFillMode: 'both',
        }}
      >
        <span style={{
          fontSize: 11,
          color: 'var(--orca-text-muted)',
          fontFamily: 'ui-monospace, monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {row.label}
        </span>
        <span style={{
          fontSize: 12,
          color: row.highlight ? 'var(--orca-accent)' : 'var(--orca-text-primary)',
          fontFamily: 'ui-monospace, monospace',
          fontWeight: row.highlight ? 600 : 400,
        }}>
          {typeof row.value === 'number' ? row.value : row.value}
          {row.unit && <span style={{ fontSize: 10, color: 'var(--orca-text-muted)', marginLeft: 3 }}>{row.unit}</span>}
        </span>
      </div>
    ))}
  </div>
);

export default DataTable;
