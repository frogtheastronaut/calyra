'use client';

import Link from 'next/link';
import '../app/colors.css';

export default function Navbar() {
  return (
    <nav
      className="navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--spacing-xl)',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2xl)', width: '100%' }}>
        <Link 
          href="/"
          className="logo"
          style={{
            textDecoration: 'none',
          }}
        >
          Calyra
        </Link>
      </div>
    </nav>
  );
}
