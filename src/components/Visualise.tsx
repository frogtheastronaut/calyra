'use client';

import { useState, useMemo, useRef } from 'react';
import { Select, Button } from '@mantine/core';
import ExportGraph from './ExportGraph';
import CalyraCalendar from './calendar';
import type { AppState } from '../utils/db';

type VisualiseProps = {
  appState: AppState;
};

export default function Visualise({ appState }: VisualiseProps) {
  const [selectedTableIndex, setSelectedTableIndex] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [visualizationType, setVisualizationType] = useState<'graph' | 'heatmap'>('graph');
  
  const graphCanvasRef = useRef<HTMLDivElement>(null);
  const heatmapCanvasRef = useRef<HTMLDivElement>(null);

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

  // Download graph as PNG
  const downloadGraph = async () => {
    const canvasRef = visualizationType === 'heatmap' ? heatmapCanvasRef : graphCanvasRef;
    if (!canvasRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        const tableName = selectedTableIndex !== null ? appState.titles[Number(selectedTableIndex)] : 'data';
        const filename = `${tableName}_${selectedColumn}_${visualizationType}_${timestamp}.png`;
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Failed to download graph:', error);
      alert('Failed to download graph.');
    }
  };

  // Reset column selection when table changes
  const handleTableChange = (value: string | null) => {
    setSelectedTableIndex(value);
    setSelectedColumn(null);
  };

  const hasData = chartData.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 40,
        backgroundColor: 'var(--color-background)',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
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

          <Select
            label="Visualization Type"
            placeholder="Choose type"
            data={[
              { value: 'graph', label: 'Line Graph' },
              { value: 'heatmap', label: 'Calendar Heatmap' },
            ]}
            value={visualizationType}
            onChange={(value) => setVisualizationType(value as 'graph' | 'heatmap')}
            style={{ flex: 1, minWidth: 200 }}
            disabled={!hasData}
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
          <div
            style={{
              position: 'relative',
              backgroundColor: 'var(--color-white)',
              borderRadius: 12,
              padding: 24,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Download button */}
            <button
              onClick={downloadGraph}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: 8,
                padding: 8,
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
              title="Download visualization"
            >
              <span style={{ fontFamily: 'Material Icons', fontSize: 20 }}>download</span>
            </button>

            {/* Graph/Heatmap */}
            {visualizationType === 'graph' ? (
              <div
                ref={graphCanvasRef}
                style={{
                  width: '100%',
                  height: 500,
                }}
              >
                <ExportGraph data={chartData} columnName={selectedColumn} />
              </div>
            ) : (
              <div
                ref={heatmapCanvasRef}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: 20,
                }}
              >
                <CalyraCalendar 
                  clearToken={0} 
                  onDateSelected={() => {}}
                  heatmapData={heatmapData}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
