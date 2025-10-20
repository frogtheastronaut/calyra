'use client';

import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function AccountPage() {
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
            fontSize: 48,
            fontWeight: 700,
            color: '#2684FF',
            marginBottom: 16,
          }}
        >
          Account
        </h1>
        <p
          style={{
            fontSize: 18,
            color: '#666',
            maxWidth: 600,
            marginBottom: 32,
          }}
        >
          Account management coming soon.
        </p>
        <Link
          href="/"
          style={{
            color: '#2684FF',
            textDecoration: 'none',
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </>
  );
}
