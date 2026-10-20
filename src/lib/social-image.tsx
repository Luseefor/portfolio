import { ImageResponse } from 'next/og';

export function socialImage(title: string, label: string) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '68px 80px',
        background: '#faf8f2',
        color: '#25231f',
        borderLeft: '12px solid #ac4b42',
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#625e56' }}
      >
        <span>rijan.sh /</span>
        <span>{label}</span>
      </div>
      <div
        style={{
          fontSize: title.length > 65 ? 64 : 78,
          letterSpacing: '-3px',
          lineHeight: 1.12,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid #d5cfc3',
          paddingTop: 24,
          color: '#625e56',
          fontSize: 24,
        }}
      >
        Rijan Ghimire · Software engineer
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
