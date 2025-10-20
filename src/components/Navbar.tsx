import Link from 'next/link';

export default function Navbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, width: '100%' }}>
        {/* Logo/Brand */}
        <Link 
          href="/"
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#2684FF',
            textDecoration: 'none',
            letterSpacing: '-0.5px',
          }}
        >
          Calyra
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginLeft: 'auto' }}>
          <Link
            href="/pricing"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#333',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2684FF'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
          >
            Pricing
          </Link>
          <Link
            href="/account"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#333',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2684FF'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
          >
            Account
          </Link>
        </div>
      </div>
    </nav>
  );
}
