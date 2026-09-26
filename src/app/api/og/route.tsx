import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo') || 'facebook/react';

  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(135deg, #0a0a1e, #1a1a3e)',
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace',
      }}>
        <div style={{ fontSize: 120 }}>🏙️</div>
        <div style={{ 
          fontSize: 72, 
          color: '#00f0ff', 
          marginTop: 30, 
          textShadow: '0 0 30px rgba(0,240,255,0.8)',
          fontWeight: 'bold',
          letterSpacing: '-2px'
        }}>
          GitRepo Cityscape
        </div>
        <div style={{ 
          fontSize: 36, 
          color: '#8888aa', 
          marginTop: 20, 
          letterSpacing: '2px' 
        }}>
          {repo}
        </div>
      </div>
    ),
    { 
      width: 1200, 
      height: 630 
    }
  );
}
