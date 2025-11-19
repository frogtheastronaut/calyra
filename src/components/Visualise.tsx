'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Select } from '@mantine/core';
import gsap from 'gsap';
import LineGraph from './visualizations/LineGraph';
import BarGraph from './visualizations/BarGraph';
import AreaGraph from './visualizations/AreaGraph';
import ScatterPlot from './visualizations/ScatterPlot';
import SmoothLineGraph from './visualizations/SmoothLineGraph';
import StepLineGraph from './visualizations/StepLineGraph';
import CalyraCalendar from './calendar';
import type { AppState } from '../utils/db';

type VisualiseProps = {
  appState: AppState;
};

type VisualizationConfig = {
  id: string;
  name: string;
  component: React.ComponentType<{ data: { date: string; value: number }[]; columnName: string }>;
};

const chartVisualizations: VisualizationConfig[] = [
  { id: 'line', name: 'Line Chart', component: LineGraph },
  { id: 'bar', name: 'Bar Chart', component: BarGraph },
  { id: 'area', name: 'Area Chart', component: AreaGraph },
  { id: 'smooth', name: 'Smooth Line', component: SmoothLineGraph },
  { id: 'step', name: 'Step Line', component: StepLineGraph },
  { id: 'scatter', name: 'Scatter Plot', component: ScatterPlot },
];

export default function Visualise({ appState }: VisualiseProps) {
  const [selectedTableIndex, setSelectedTableIndex] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [currentVizIndex, setCurrentVizIndex] = useState<number>(0);
  const vizContainerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get table options for dropdown
  const tableOptions = useMemo(() => {
    return appState.titles.map((title, index) => ({
      value: String(index),
      label: title,
    }));
  }, [appState.titles]);

  // Get column options for selected table (excluding Date)
  const columnOptions = useMemo(() => {
    if (selectedTableIndex === null) return [];
    
    const tableIndex = Number(selectedTableIndex);
    const schema = appState.tableSchemas[tableIndex];
    
    if (!schema) return [];
    
    return schema.columns
      .filter((col) => col !== 'Date')
      .map((col) => ({
        value: col,
        label: col,
      }));
  }, [selectedTableIndex, appState.tableSchemas]);

  // Get chart data for selected table and column
  const chartData = useMemo(() => {
    if (selectedTableIndex === null || selectedColumn === null) return [];
    
    const tableIndex = Number(selectedTableIndex);
    const schema = appState.tableSchemas[tableIndex];
    
    if (!schema) return [];
    
    return schema.data
      .map((row) => {
        const value = row[selectedColumn];
        let numericValue = 0;
        
        if (value) {
          if (value.includes('/')) {
            const parts = value.split('/');
            if (parts.length === 2) {
              const num = Number(parts[0].trim());
              const denom = Number(parts[1].trim());
              if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
                numericValue = num / denom;
              }
            }
          } else {
            numericValue = Number(value);
            if (isNaN(numericValue)) numericValue = 0;
          }
        }
        
        return {
          date: row.Date,
          value: numericValue,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedTableIndex, selectedColumn, appState.tableSchemas]);

  // Get heatmap data for calendar
  const heatmapData = useMemo(() => {
    if (selectedTableIndex === null || selectedColumn === null) return {};
    
    const tableIndex = Number(selectedTableIndex);
    const schema = appState.tableSchemas[tableIndex];
    
    if (!schema) return {};
    
    const heatmap: { [date: string]: number } = {};
    
    schema.data.forEach((row) => {
      const date = row.Date;
      const value = row[selectedColumn];
      
      if (!value) return;
      
      let numericValue: number;
      
      // Check if it's a fraction
      if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 2) {
          const num = Number(parts[0].trim());
          const denom = Number(parts[1].trim());
          if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
            numericValue = num / denom;
          } else {
            return;
          }
        } else {
          return;
        }
      } else {
        // Plain number
        numericValue = Number(value);
        if (isNaN(numericValue)) return;
      }
      
      heatmap[date] = numericValue;
    });
    
    return heatmap;
  }, [selectedTableIndex, selectedColumn, appState.tableSchemas]);

  // Download visualization as PNG
  const downloadVisualization = async (element: HTMLDivElement, vizName: string) => {
    if (!element) return;

    try {
      // Hide download button and title before capturing
      const downloadBtn = element.querySelector('[data-download-btn]') as HTMLElement;
      const title = element.querySelector('[data-viz-title]') as HTMLElement;
      const metadata = element.querySelector('[data-viz-metadata]') as HTMLElement;
      
      if (downloadBtn) downloadBtn.style.display = 'none';
      if (title) title.style.display = 'none';
      if (metadata) metadata.style.display = 'block';

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      // Show download button and title again, hide metadata
      if (downloadBtn) downloadBtn.style.display = 'flex';
      if (title) title.style.display = 'block';
      if (metadata) metadata.style.display = 'none';

      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const tableName = selectedTableIndex !== null ? appState.titles[Number(selectedTableIndex)] : 'data';
        const filename = `${tableName}_${selectedColumn}.png`;
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Failed to download visualization:', error);
      alert('Failed to download visualization.');
    }
  };

  // Navigate between visualizations with slide animation
  const navigateViz = (direction: 'left' | 'right') => {
    if (isAnimating || !vizContainerRef.current) return;
    
    const totalVizCount = chartVisualizations.length + 1; // +1 for heatmap
    setIsAnimating(true);
    
    const slideDistance = 100;
    
    // Slide out
    gsap.to(vizContainerRef.current, {
      x: direction === 'left' ? slideDistance : -slideDistance,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        // Update index
        if (direction === 'left') {
          setCurrentVizIndex((prev) => (prev - 1 + totalVizCount) % totalVizCount);
        } else {
          setCurrentVizIndex((prev) => (prev + 1) % totalVizCount);
        }
        
        // Slide in from opposite side
        if (vizContainerRef.current) {
          gsap.fromTo(
            vizContainerRef.current,
            { x: direction === 'left' ? -slideDistance : slideDistance, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.4,
              ease: 'power2.inOut',
              onComplete: () => setIsAnimating(false),
            }
          );
        }
      },
    });
  };

  // Reset column selection when table changes
  const handleTableChange = (value: string | null) => {
    setSelectedTableIndex(value);
    setSelectedColumn(null);
  };

  const hasData = chartData.length > 0;

  const totalVizCount = chartVisualizations.length + 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 40,
        backgroundColor: 'var(--color-background)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontSize: 32,
            fontWeight: 600,
            marginBottom: 8,
            color: 'var(--color-primary)',
          }}
        >
          Visualise Your Data
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--color-text)',
            marginBottom: 32,
          }}
        >
          Select a table and column to visualize your progress over time
        </p>

        {/* Dropdowns */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 32,
            flexWrap: 'wrap',
          }}
        >
          <Select
            label="Select Table"
            placeholder="Choose a table"
            data={tableOptions}
            value={selectedTableIndex}
            onChange={handleTableChange}
            style={{ flex: 1, minWidth: 200 }}
            disabled={tableOptions.length === 0}
          />
          
          <Select
            label="Select Column"
            placeholder="Choose a column"
            data={columnOptions}
            value={selectedColumn}
            onChange={setSelectedColumn}
            style={{ flex: 1, minWidth: 200 }}
            disabled={columnOptions.length === 0 || selectedTableIndex === null}
          />
        </div>

        {/* Visualization Area */}
        {tableOptions.length === 0 ? (
          <div
            style={{
              padding: 80,
              textAlign: 'center',
              backgroundColor: 'var(--color-white)',
              borderRadius: 12,
              border: '2px dashed var(--color-gray-300)',
            }}
          >
            <span style={{ fontFamily: 'Material Icons', fontSize: 64, color: 'var(--color-gray-400)' }}>
              table_chart
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 500, marginTop: 16, color: 'var(--color-text)' }}>
              No Tables Yet
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-gray-600)', marginTop: 8 }}>
              Go to the Calendar view to create your first table
            </p>
          </div>
        ) : selectedTableIndex === null ? (
          <div
            style={{
              padding: 80,
              textAlign: 'center',
              backgroundColor: 'var(--color-white)',
              borderRadius: 12,
              border: '2px dashed var(--color-gray-300)',
            }}
          >
            <span style={{ fontFamily: 'Material Icons', fontSize: 64, color: 'var(--color-gray-400)' }}>
              arrow_upward
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 500, marginTop: 16, color: 'var(--color-text)' }}>
              Select a Table
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-gray-600)', marginTop: 8 }}>
              Choose a table from the dropdown above to get started
            </p>
          </div>
        ) : selectedColumn === null ? (
          <div
            style={{
              padding: 80,
              textAlign: 'center',
              backgroundColor: 'var(--color-white)',
              borderRadius: 12,
              border: '2px dashed var(--color-gray-300)',
            }}
          >
            <span style={{ fontFamily: 'Material Icons', fontSize: 64, color: 'var(--color-gray-400)' }}>
              view_column
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 500, marginTop: 16, color: 'var(--color-text)' }}>
              Select a Column
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-gray-600)', marginTop: 8 }}>
              Choose a column to visualize
            </p>
          </div>
        ) : !hasData ? (
          <div
            style={{
              padding: 80,
              textAlign: 'center',
              backgroundColor: 'var(--color-white)',
              borderRadius: 12,
              border: '2px dashed var(--color-gray-300)',
            }}
          >
            <span style={{ fontFamily: 'Material Icons', fontSize: 64, color: 'var(--color-gray-400)' }}>
              data_usage
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 500, marginTop: 16, color: 'var(--color-text)' }}>
              No Data Available
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-gray-600)', marginTop: 8 }}>
              Add some data in the Calendar view first
            </p>
          </div>
        ) : (
          /* Single visualization view with arrow navigation */
          <div style={{ position: 'relative' }}>
            {/* Left Arrow */}
            <button
              onClick={() => navigateViz('left')}
              style={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'var(--color-white)',
                boxShadow: 'var(--shadow-lg)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-white)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <span style={{ fontFamily: 'Material Icons', fontSize: 28, color: 'var(--color-text)' }}>
                chevron_left
              </span>
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => navigateViz('right')}
              style={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'var(--color-white)',
                boxShadow: 'var(--shadow-lg)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-white)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <span style={{ fontFamily: 'Material Icons', fontSize: 28, color: 'var(--color-text)' }}>
                chevron_right
              </span>
            </button>

            <div
              ref={vizContainerRef}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
            {/* Single Chart Visualization */}
            {currentVizIndex < chartVisualizations.length ? (() => {
              const viz = chartVisualizations[currentVizIndex];
              const VizComponent = viz.component;
              const tableName = selectedTableIndex !== null ? appState.titles[Number(selectedTableIndex)] : '';
              return (
                <div
                  key={viz.id}
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 900,
                  }}
                >
                  <button
                    data-download-btn
                    onClick={(e) => {
                      const card = e.currentTarget.parentElement;
                      if (card) downloadVisualization(card as HTMLDivElement, viz.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: -50,
                      background: 'var(--color-accent)',
                      border: 'none',
                      borderRadius: 8,
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-white)',
                      zIndex: 10,
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-md)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    title={`Download ${viz.name}`}
                  >
                    <span style={{ fontFamily: 'Material Icons', fontSize: 24 }}>download</span>
                  </button>
                  <div
                    style={{
                      width: '100%',
                      height: 500,
                    }}
                  >
                    <VizComponent data={chartData} columnName={selectedColumn || ''} />
                  </div>
                  <div data-viz-metadata style={{
                    display: 'none',
                    fontSize: 11,
                    color: 'var(--color-gray-600)',
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid var(--color-gray-200)',
                    lineHeight: 1.5,
                  }} tracking-widest>
                    <div>{tableName}, {selectedColumn}</div>
                    <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>Made with Calyra</div>
                  </div>
                </div>
              );
            })() : (
            /* Calendar Heatmap */
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 900,
              }}
            >
              <button
                data-download-btn
                onClick={(e) => {
                  const card = e.currentTarget.parentElement;
                  if (card) downloadVisualization(card as HTMLDivElement, 'heatmap');
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'var(--color-accent)',
                  border: 'none',
                  borderRadius: 8,
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-white)',
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-md)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                title="Download Calendar Heatmap"
              >
                <span style={{ fontFamily: 'Material Icons', fontSize: 24 }}>download</span>
              </button>
              <div
                style={{
                  width: '100%',
                  height: 500,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ transform: 'scale(1.1)', transformOrigin: 'center' }}>
                  <CalyraCalendar 
                    clearToken={0} 
                    onDateSelected={() => {}}
                    heatmapData={heatmapData}
                    hideControls={true}
                  />
                </div>
              </div>
              <div data-viz-metadata style={{
                display: 'none',
                fontSize: 11,
                color: 'var(--color-gray-600)',
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid var(--color-gray-200)',
                lineHeight: 1.5,
              }}>
                    <div>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).replace(' ', ' /')}</div>
                    <div>{selectedColumn}</div>
                    <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>Made with Calyra</div>
              </div>
            </div>
            )}
            </div>

            {/* Pagination Dots */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                marginTop: 32,
              }}
            >
              {Array.from({ length: totalVizCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVizIndex(index)}
                  style={{
                    width: currentVizIndex === index ? 8 : 6,
                    height: currentVizIndex === index ? 8 : 6,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: currentVizIndex === index ? 'var(--color-primary)' : 'var(--color-gray-400)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                    opacity: currentVizIndex === index ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (currentVizIndex !== index) {
                      e.currentTarget.style.opacity = '0.8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentVizIndex !== index) {
                      e.currentTarget.style.opacity = '0.5';
                    }
                  }}
                  aria-label={`Go to visualization ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
