'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div
        style={{
          marginTop: 60,
          height: 'calc(100vh - 60px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#2684FF',
            marginBottom: 16,
            letterSpacing: '-1px',
          }}
        >
          Welcome to Calyra
        </h1>
        <p
          style={{
            fontSize: 20,
            color: '#666',
            maxWidth: 600,
            marginBottom: 48,
            lineHeight: 1.6,
          }}
        >
          Plan it. Track it. Graph it. Your personal data tracking and visualization tool.
        </p>
        <Link
          href="/app"
          style={{
            backgroundColor: '#2684FF',
            color: '#fff',
            padding: '16px 32px',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(38, 132, 255, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(38, 132, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(38, 132, 255, 0.3)';
          }}
        >
          Get Started
        </Link>
      </div>
    </>
  );
}
