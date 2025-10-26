'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import '@mantine/core/styles.css';
import './colors.css';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div
        style={{
          marginTop: 'var(--navbar-height)',
          height: 'calc(100vh - var(--navbar-height))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 var(--spacing-lg)',
          textAlign: 'center',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--font-size-5xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--spacing-md)',
            letterSpacing: '-1px',
          }}
        >
          Every day tells a story <br></br>
          Graph it with <span style={{ color: 'var(--color-accent)' }}>Calyra</span>
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text)',
            maxWidth: '700px',
            marginBottom: 'var(--spacing-sm)',
            lineHeight: 1.7,
          }}
        >
          This is a free and open-source tool for everyone who think in data, not dates.<br></br>
          Calyra combines a calendar and spreadsheet so you can log your progress, visualize trends, and turn your data into insight.
        </p>
        <Link
          href="/app"
          className="btn-primary"
          style={{
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
          }}
        >
          Open Calyra
        </Link>
      </div>
    </>
  );
}
