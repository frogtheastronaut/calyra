'use client';

import { useState } from 'react';
import AppPage from './app-page';
import Link from 'next/link';
import '../colors.css';

export default function AppLayout() {
  const [hasDataToExport, setHasDataToExport] = useState(false);
  const [hasHeatmap, setHasHeatmap] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const handleExportStateChange = (hasData: boolean, hasHeatmapEnabled: boolean) => {
    setHasDataToExport(hasData);
    setHasHeatmap(hasHeatmapEnabled);
  };

  const handleExportClick = (type: 'graph' | 'heatmap') => {
    if (typeof window.__calyraExport === 'function') {
      window.__calyraExport(type);
    }
    setExportDropdownOpen(false);
  };

  return (
    <>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginLeft: 'auto', marginRight: 'var(--spacing-md)' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                disabled={!hasDataToExport || !hasHeatmap}
                style={{
                  background: hasDataToExport && hasHeatmap ? 'var(--color-accent)' : 'var(--color-gray-400)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  cursor: hasDataToExport && hasHeatmap ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  color: 'var(--color-white)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  transition: 'all var(--transition-base)',
                  boxShadow: hasDataToExport && hasHeatmap ? 'var(--shadow-md)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (hasDataToExport && hasHeatmap) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasDataToExport && hasHeatmap) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
                title="Export data"
              >
                <span style={{ fontFamily: 'Material Icons', fontSize: 18 }}>upload</span>
                <span>Export</span>
              </button>

              {exportDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + var(--spacing-sm))',
                    right: 0,
                    backgroundColor: 'var(--color-white)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    overflow: 'hidden',
                    minWidth: '200px',
                    zIndex: 101,
                    border: '1px solid var(--color-gray-200)',
                  }}
                >
                  <button
                    onClick={() => handleExportClick('graph')}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontFamily: 'Material Icons', fontSize: 20, color: 'var(--color-primary)' }}>
                      show_chart
                    </span>
                    <span>Export to Line Graph</span>
                  </button>

                  <button
                    onClick={() => handleExportClick('heatmap')}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontFamily: 'Material Icons', fontSize: 20, color: 'var(--color-accent)' }}>
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
          marginTop: 'var(--navbar-height)',
          height: 'calc(100vh - var(--navbar-height))',
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
