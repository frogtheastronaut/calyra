'use client';

import Link from 'next/link';
import Navbar from '../../components/Navbar';
import '../colors.css';

export default function AccountPage() {
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
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          Account
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text)',
            maxWidth: '600px',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          Paid accounts will be added soon! Thank you for your patience and willingness
		  to try out Calyra. In the meantime, you can use Calyra for free without an account.
		  Stay tuned!
        </p>
      </div>
    </>
  );
}
