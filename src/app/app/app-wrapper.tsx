'use client';

import { useState, useEffect } from 'react';
import AppPage from './app-page';
import Visualise from '../../components/Visualise';
import Link from 'next/link';
import { loadAppState, type AppState } from '../../utils/db';
import '../colors.css';

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'visualise'>('calendar');
  const [appState, setAppState] = useState<AppState>({ titles: [], tableSchemas: {} });

  // Load app state for Visualise tab
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedState = await loadAppState();
        if (savedState) {
          setAppState(savedState);
        }
      } catch (error) {
        console.error('Failed to load data from IndexedDB:', error);
      }
    };

    loadData();

    // Re-load data whenever we switch to visualise tab
    if (activeTab === 'visualise') {
      loadData();
    }
  }, [activeTab]);

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

          {/* Tab Navigation */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginLeft: 'auto',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              padding: '4px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <button
              onClick={() => setActiveTab('calendar')}
              style={{
                background: activeTab === 'calendar' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'calendar' ? 'var(--color-white)' : 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
              }}
            >
              <span style={{ fontFamily: 'Material Icons', fontSize: 18 }}>calendar_month</span>
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('visualise')}
              style={{
                background: activeTab === 'visualise' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'visualise' ? 'var(--color-white)' : 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
              }}
            >
              <span style={{ fontFamily: 'Material Icons', fontSize: 18 }}>bar_chart</span>
              <span>Visualise</span>
            </button>
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
        {activeTab === 'calendar' ? (
          <AppPage />
        ) : (
          <Visualise appState={appState} />
        )}
      </div>
    </>
  );
}
