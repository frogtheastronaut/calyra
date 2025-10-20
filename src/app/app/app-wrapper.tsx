'use client';

import { useState } from 'react';
import AppPage from './app-page';
import Link from 'next/link';

export default function AppLayout() {
  const [hasDataToExport, setHasDataToExport] = useState(false);
  const [hasHeatmap, setHasHeatmap] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const handleExportStateChange = (hasData: boolean, hasHeatmapEnabled: boolean) => {
    setHasDataToExport(hasData);
    setHasHeatmap(hasHeatmapEnabled);
  };

  const handleExportClick = (type: 'graph' | 'heatmap') => {
    if ((window as any).__calyraExport) {
      (window as any).__calyraExport(type);
    }
    setExportDropdownOpen(false);
  };

  return (
    <>
      {/* Navbar */}
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

          {/* Navigation Links - moved to the right but not at the end */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 'auto', marginRight: 16 }}>
            <Link
              href="/"
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
              Home
            </Link>
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

            {/* Export button with dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                disabled={!hasDataToExport || !hasHeatmap}
                style={{
                  background: hasDataToExport && hasHeatmap ? '#2684FF' : '#ccc',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 14px',
                  cursor: hasDataToExport && hasHeatmap ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                title="Export data"
              >
                <span style={{ fontFamily: 'Material Icons', fontSize: 16 }}>upload</span>
                <span>Export</span>
              </button>

              {/* Dropdown menu */}
              {exportDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    minWidth: 200,
                    zIndex: 101,
                  }}
                >
                  <button
                    onClick={() => handleExportClick('graph')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#000',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontFamily: 'Material Icons', fontSize: 20, color: '#2684FF' }}>
                      show_chart
                    </span>
                    <span>Export to Line Graph</span>
                  </button>

                  <button
                    onClick={() => handleExportClick('heatmap')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#000',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontFamily: 'Material Icons', fontSize: 20, color: '#1976d2' }}>
                      calendar_month
                    </span>
                    <span>Export to Heatmap</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div
        style={{
          marginTop: 60,
          height: 'calc(100vh - 60px)',
        }}
      >
        <AppPage 
          onExportStateChange={handleExportStateChange}
          onExportClick={() => {}}
        />
      </div>
    </>
  );
}
