'use client';

import CalyraCalendar from '../../components/calendar';
import ExportGraph from '../../components/ExportGraph';
import Tutorial from '../../components/Tutorial';
import { Box, Button, TextInput, Modal } from '@mantine/core';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { saveAppState, loadAppState, saveMonthlyExport, type AppState, type MonthlyExport } from '../../utils/db';
import dayjs from 'dayjs';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

type TableData = {
  [key: string]: string;
};

type TableSchema = {
  columns: string[];
  data: TableData[];
};

interface AppPageProps {
  onExportStateChange?: (hasData: boolean, hasHeatmap: boolean) => void;
  onExportClick?: () => void;
}

export default function AppPage({ onExportStateChange, onExportClick }: AppPageProps) {
  // Table titles and selection
  const [titles, setTitles] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Table data storage
  const [tableSchemas, setTableSchemas] = useState<{ [key: number]: TableSchema }>({});
  
  // Column management
  const [newColumnName, setNewColumnName] = useState('');
  
  // Date selection and row entry
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentRowData, setCurrentRowData] = useState<TableData>({});
  
  // Heatmap state
  const [selectedHeatmapColumn, setSelectedHeatmapColumn] = useState<string | null>(null);
  
  // Calendar coordination
  const [calendarClearToken, setCalendarClearToken] = useState(0);

  // Settings modal state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsTableIndex, setSettingsTableIndex] = useState<number | null>(null);
  const [editedTableName, setEditedTableName] = useState('');

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'graph' | 'heatmap'>('graph');
  const exportCanvasRef = useRef<HTMLDivElement>(null);
  const heatmapCanvasRef = useRef<HTMLDivElement>(null);

  // Export dropdown state (managed by parent) - local state removed

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [, setTutorialCompleted] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState('auto');

  // Loading state
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
  };

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedState = await loadAppState();
        if (savedState) {
          setTitles(savedState.titles);
          setTableSchemas(savedState.tableSchemas);
        } else {
          // No saved data - show tutorial
          setShowTutorial(true);
        }
      } catch (error) {
        console.error('Failed to load data from IndexedDB:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save data to IndexedDB whenever titles or tableSchemas change
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load

    const saveData = async () => {
      try {
        const state: AppState = {
          titles,
          tableSchemas,
        };
        await saveAppState(state);
      } catch (error) {
        console.error('Failed to save data to IndexedDB:', error);
      }
    };

    saveData();
  }, [titles, tableSchemas, isLoaded]);

  // Check if there's any data to export
  const hasDataToExport = useMemo(() => {
    if (selectedIndex === null) return false;
    const current = tableSchemas[selectedIndex];
    return current && current.data.length > 0;
  }, [selectedIndex, tableSchemas]);

  // Notify parent component of export state
  useEffect(() => {
    if (onExportStateChange) {
      onExportStateChange(hasDataToExport, selectedHeatmapColumn !== null);
    }
  }, [hasDataToExport, selectedHeatmapColumn, onExportStateChange]);

  // Export all data for the selected table/column
  const exportData = useMemo(() => {
    return async (type: 'graph' | 'heatmap') => {
    if (selectedIndex === null || !selectedHeatmapColumn) {
      alert('Please select a table and enable heatmap visualization on a column before exporting.');
      return;
    }

    // Get current month in YYYY-MM format
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Check if already exported this month
    const { getMonthlyExport } = await import('../../utils/db');
    const existingExport = await getMonthlyExport(currentMonth, titles[selectedIndex], selectedHeatmapColumn);
    
    if (existingExport) {
      const exportDate = new Date(existingExport.generatedAt);
      const formattedDate = exportDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      alert(`You've already exported this data this month on ${formattedDate}. You can export again next month.`);
      return;
    }

    const current = tableSchemas[selectedIndex];
    
    // Get all data and sort by date
    const allData = current.data
      .map((row) => {
        const value = row[selectedHeatmapColumn];
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

    if (allData.length === 0) {
      alert('No data found to export.');
      return;
    }

    // Save to IndexedDB with current month
    const exportDataObj: MonthlyExport = {
      month: currentMonth,
      tableTitle: titles[selectedIndex],
      columnName: selectedHeatmapColumn,
      chartData: allData,
      generatedAt: Date.now(),
    };

    try {
      await saveMonthlyExport(exportDataObj);
      setExportType(type);
      setExportModalOpen(true);
    } catch (error) {
      console.error('Failed to save export:', error);
      alert('Failed to save export data.');
    }
  };
  }, [selectedIndex, selectedHeatmapColumn, tableSchemas, titles]);

  // Expose export function to parent
  useEffect(() => {
    if (onExportClick) {
      window.__calyraExport = (type: 'graph' | 'heatmap') => {
        // call the memoized exportData
        void exportData(type);
      };
    }
    return () => {
      if (window.__calyraExport) delete window.__calyraExport;
    };
  }, [onExportClick, exportData]);

  // Download the graph as PNG
  const downloadGraph = async () => {
    const canvasRef = exportType === 'heatmap' ? heatmapCanvasRef : exportCanvasRef;
    if (!canvasRef.current) return;

    try {
      // Use html2canvas to capture the graph
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      // Convert to blob and download
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = dayjs().format('YYYY-MM-DD');
        const filename = `${titles[selectedIndex!]}_${selectedHeatmapColumn}_${exportType}_${timestamp}.png`;
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

  // Get current month's export data for display
  const currentExportData = useMemo(() => {
    if (selectedIndex === null || !selectedHeatmapColumn) return [];
    
    const current = tableSchemas[selectedIndex];
    
    return current.data
      .map((row) => {
        const value = row[selectedHeatmapColumn];
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
  }, [selectedIndex, selectedHeatmapColumn, tableSchemas]);

  // Trigger tutorial when export becomes available
  useEffect(() => {
    if (showTutorial && hasDataToExport && selectedHeatmapColumn) {
      setCurrentTrigger('export-ready');
    }
  }, [hasDataToExport, selectedHeatmapColumn, showTutorial]);

  // Validate heatmap column when data changes
  useEffect(() => {
    if (selectedIndex === null || !selectedHeatmapColumn) return;
    
    const current = tableSchemas[selectedIndex];
    if (!current) {
      setSelectedHeatmapColumn(null);
      return;
    }
    
    // Check if the selected heatmap column still exists
    if (!current.columns.includes(selectedHeatmapColumn)) {
      setSelectedHeatmapColumn(null);
      return;
    }
    
    // Check if all values are still valid
    const allValid = current.data.every((row) => {
      const value = row[selectedHeatmapColumn];
      if (value === '' || value === undefined) return true;
      if (!isNaN(Number(value))) return true;
      if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 2) {
          const num = Number(parts[0].trim());
          const denom = Number(parts[1].trim());
          return !isNaN(num) && !isNaN(denom) && denom !== 0;
        }
      }
      return false;
    });
    
    // If data is no longer valid, clear the heatmap
    if (!allValid) {
      setSelectedHeatmapColumn(null);
    }
  }, [selectedIndex, selectedHeatmapColumn, tableSchemas]);

  // Add a new table
  const addTitle = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    
    const newIndex = titles.length;
    setTitles((prev) => [...prev, trimmed]);
    setTableSchemas((prev) => ({
      ...prev,
      [newIndex]: { columns: ['Date'], data: [] },
    }));
    setNewTitle('');
    
    // Trigger tutorial progression
    if (showTutorial) {
      setCurrentTrigger('table-created');
    }
  };

  // Add a column to the selected table
  const addColumn = () => {
    if (selectedIndex === null || !newColumnName.trim()) return;
    
    const columnName = newColumnName.trim();
    const current = tableSchemas[selectedIndex] || { columns: ['Date'], data: [] };
    
    if (current.columns.includes(columnName)) return;
    
    setTableSchemas((prev) => ({
      ...prev,
      [selectedIndex]: {
        columns: [...current.columns, columnName],
        data: current.data.map((row) => ({ ...row, [columnName]: '' })),
      },
    }));
    setNewColumnName('');
    
    // Trigger tutorial progression
    if (showTutorial) {
      setCurrentTrigger('column-added');
    }
  };

  // Remove a column from the selected table
  const removeColumn = (columnName: string) => {
    if (selectedIndex === null || columnName === 'Date') return;
    
    setTableSchemas((prev) => {
      const current = prev[selectedIndex];
      const newColumns = current.columns.filter((col) => col !== columnName);
      
      // Remove the column from all rows
      let newData = current.data.map((row) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [columnName]: _, ...rest } = row;
        return rest;
      });
      
      // If only Date column is left, delete all rows (they're all empty now)
      if (newColumns.length === 1 && newColumns[0] === 'Date') {
        newData = [];
      } else {
        // Otherwise, check each row and delete if all non-Date fields are empty
        newData = newData.filter((row) => {
          const hasData = newColumns.some((col) => {
            if (col === 'Date') return false;
            const value = row[col];
            return value && value.trim() !== '';
          });
          return hasData;
        });
      }
      
      return {
        ...prev,
        [selectedIndex]: {
          columns: newColumns,
          data: newData,
        },
      };
    });
  };

  // Add or update a row with the selected date
  const addRow = () => {
    if (selectedIndex === null || !selectedDate) return;
    
    const current = tableSchemas[selectedIndex] || { columns: ['Date'], data: [] };
    const existingRowIndex = current.data.findIndex((row) => row.Date === selectedDate);
    
    // Build the complete row data with all columns
    const newRowData: TableData = { Date: selectedDate };
    current.columns.forEach((col) => {
      if (col !== 'Date') {
        newRowData[col] = currentRowData[col] || '';
      }
    });
    
    // Check if all non-Date fields are empty
    const isRowEmpty = current.columns
      .filter((col) => col !== 'Date')
      .every((col) => {
        const value = newRowData[col];
        return !value || value.trim() === '';
      });
    
    if (isRowEmpty) {
      // If row is empty, delete it if it exists
      if (existingRowIndex !== -1) {
        const updatedData = current.data.filter((_, index) => index !== existingRowIndex);
        setTableSchemas((prev) => ({
          ...prev,
          [selectedIndex]: {
            ...current,
            data: updatedData,
          },
        }));
      }
      // Don't add an empty row - just clear the state
    } else if (existingRowIndex !== -1) {
      // Update existing row
      const updatedData = [...current.data];
      updatedData[existingRowIndex] = newRowData;
      
      setTableSchemas((prev) => ({
        ...prev,
        [selectedIndex]: {
          ...current,
          data: updatedData,
        },
      }));
    } else {
      // Add new row
      setTableSchemas((prev) => ({
        ...prev,
        [selectedIndex]: {
          ...current,
          data: [...current.data, newRowData],
        },
      }));
      
      // Trigger tutorial progression
      if (showTutorial) {
        setCurrentTrigger('row-added');
      }
    }
    
    // Reset state
    setCurrentRowData({});
    setSelectedDate(null);
    setCalendarClearToken((v) => v + 1);
  };

  // Update an existing cell in the table
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateCell = (rowIndex: number, columnId: string, value: string) => {
    if (selectedIndex === null) return;
    
    setTableSchemas((prev) => {
      const current = prev[selectedIndex];
      const newData = [...current.data];
      newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
      
      return {
        ...prev,
        [selectedIndex]: {
          ...current,
          data: newData,
        },
      };
    });
  };

  // Update the current row being entered
  const updateCurrentRowData = (columnId: string, value: string) => {
    setCurrentRowData((prev) => ({ ...prev, [columnId]: value }));
  };

  // Toggle table selection
  const toggleSelectTitle = (index: number) => {
    const isSelected = selectedIndex === index;
    if (isSelected) {
      setSelectedIndex(null);
      setSelectedHeatmapColumn(null);
    } else {
      setSelectedIndex(index);
      // Clear date selection and row data when switching tables
      setSelectedDate(null);
      setCurrentRowData({});
      setSelectedHeatmapColumn(null);
      setCalendarClearToken((v) => v + 1);
      
      // Trigger tutorial progression
      if (showTutorial) {
        setCurrentTrigger('table-selected');
      }
    }
  };

  // Open settings modal for a table
  const openSettings = (index: number) => {
    setSettingsTableIndex(index);
    setEditedTableName(titles[index]);
    setSettingsModalOpen(true);
  };

  // Close settings modal
  const closeSettings = () => {
    setSettingsModalOpen(false);
    setSettingsTableIndex(null);
    setEditedTableName('');
  };

  // Rename table
  const renameTable = () => {
    if (settingsTableIndex === null) return;
    
    const trimmed = editedTableName.trim();
    if (!trimmed) return;
    
    setTitles((prev) => {
      const newTitles = [...prev];
      newTitles[settingsTableIndex] = trimmed;
      return newTitles;
    });
    
    closeSettings();
  };

  // Delete table
  const deleteTable = () => {
    if (settingsTableIndex === null) return;
    
    // Remove from titles
    setTitles((prev) => prev.filter((_, i) => i !== settingsTableIndex));
    
    // Remove from schemas and reindex
    setTableSchemas((prev) => {
      const newSchemas: { [key: number]: TableSchema } = {};
      let newIndex = 0;
      
      Object.keys(prev).forEach((key) => {
        const oldIndex = Number(key);
        if (oldIndex !== settingsTableIndex) {
          newSchemas[newIndex] = prev[oldIndex];
          newIndex++;
        }
      });
      
      return newSchemas;
    });
    
    // Clear selection if this table was selected
    if (selectedIndex === settingsTableIndex) {
      setSelectedIndex(null);
      setSelectedDate(null);
      setCurrentRowData({});
      setSelectedHeatmapColumn(null);
    } else if (selectedIndex !== null && selectedIndex > settingsTableIndex) {
      // Adjust selected index if it's after the deleted table
      setSelectedIndex(selectedIndex - 1);
    }
    
    closeSettings();
  };

  // Toggle heatmap for a column
  const toggleHeatmap = (columnName: string) => {
    if (selectedIndex === null) return;
    
    const current = tableSchemas[selectedIndex];
    
    // Check if all values in this column are numeric or fractions
    const allValid = current.data.every((row) => {
      const value = row[columnName];
      if (value === '' || value === undefined) return true;
      
      // Check if it's a plain number
      if (!isNaN(Number(value))) return true;
      
      // Check if it's a fraction (e.g., "10/10")
      if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 2) {
          const num = Number(parts[0].trim());
          const denom = Number(parts[1].trim());
          return !isNaN(num) && !isNaN(denom) && denom !== 0;
        }
      }
      
      return false;
    });
    
    if (!allValid) {
      alert('This column contains invalid values. Only numbers and fractions (like "10/10") can be displayed as a heatmap.');
      return;
    }
    
    // Toggle heatmap
    if (selectedHeatmapColumn === columnName) {
      setSelectedHeatmapColumn(null);
    } else {
      setSelectedHeatmapColumn(columnName);
      
      // Trigger tutorial progression
      if (showTutorial) {
        setCurrentTrigger('heatmap-enabled');
      }
    }
  };

  // Get heatmap data for calendar
  const getHeatmapData = useMemo(() => {
    if (selectedIndex === null || !selectedHeatmapColumn) return {};
    
    const current = tableSchemas[selectedIndex];
    const heatmapData: { [date: string]: number } = {};
    
    current.data.forEach((row) => {
      const date = row.Date;
      const value = row[selectedHeatmapColumn];
      
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
      
      heatmapData[date] = numericValue;
    });
    
    return heatmapData;
  }, [selectedIndex, selectedHeatmapColumn, tableSchemas]);

  // Handle calendar date selection/deselection
  const handleCalendarDateSelect = (date: string | null) => {
    if (date === null) {
      setSelectedDate(null);
      setCurrentRowData({});
      return;
    }
    
    // Don't allow date selection if no table is selected or table has no columns other than Date
    if (selectedIndex === null) return;
    
    const current = tableSchemas[selectedIndex];
    if (current.columns.length <= 1) {
      alert('Please add at least one column before adding rows.');
      setCalendarClearToken((v) => v + 1); // Clear calendar selection
      return;
    }
    
    setSelectedDate(date);
    
    // Check if row with this date already exists
    const existingRow = current.data.find((row) => row.Date === date);
    
    if (existingRow) {
      // Load existing row data
      setCurrentRowData(existingRow);
    } else {
      // Initialize empty row
      const emptyRow: TableData = {};
      current.columns.forEach((col) => {
        if (col !== 'Date') emptyRow[col] = '';
      });
      setCurrentRowData(emptyRow);
    }
    
    // Trigger tutorial progression
    if (showTutorial) {
      setCurrentTrigger('date-selected');
    }
  };

  // TanStack Table configuration
  const currentSchema = selectedIndex !== null ? tableSchemas[selectedIndex] : null;
  
  const columns = useMemo<ColumnDef<TableData>[]>(() => {
    if (!currentSchema) return [];
    
    return currentSchema.columns.map((col) => ({
      accessorKey: col,
      header: col,
      cell: (info) => {
        const value = info.getValue() as string;
        
        return (
          <div
            style={{
              padding: '6px 8px',
              fontSize: 14,
            }}
          >
            {value}
          </div>
        );
      },
    }));
  }, [currentSchema]);

  const table = useReactTable({
    data: currentSchema?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        padding: 20,
        gap: 20,
        position: 'relative',
      }}
    >
      {/* Tutorial */}
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} currentTrigger={currentTrigger} />}

      {/* Left section: Calendar and Table Titles */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 400,
          flexShrink: 0,
        }}
      >
        {/* Calendar */}
        <div data-tutorial="calendar" style={{ flex: '0 0 auto' }}>
          <CalyraCalendar 
            clearToken={calendarClearToken} 
            onDateSelected={handleCalendarDateSelect}
            heatmapData={getHeatmapData}
          />
        </div>

        {/* Table management panel */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#f5f5f5',
            marginTop: 10,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 6,
            minHeight: 0,
          }}
        >
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            {/* Add new table input */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <TextInput
                data-tutorial="table-input"
                placeholder="New table title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTitle();
                }}
                style={{ flex: 1 }}
              />
              <Button onClick={addTitle} variant="filled" color="blue" data-tutorial="table-input-button">
                Add
              </Button>
            </div>

            {/* Table list */}
            <div data-tutorial="table-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {titles.length === 0 && (
                <div style={{ color: '#666', fontSize: 14 }}>No tables yet. Add one above.</div>
              )}
              {titles.map((title, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 6,
                      backgroundColor: isSelected ? '#2684FF' : '#fff',
                      color: isSelected ? '#fff' : '#000',
                      border: isSelected ? '2px solid #2684FF' : '1px solid #ddd',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSelectTitle(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleSelectTitle(index);
                        }
                      }}
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {title}
                    </div>
                    <button
                      data-tutorial="settings-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSettings(index);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#fff' : '#666',
                        fontSize: 18,
                        opacity: 0.7,
                        transition: 'opacity 0.15s ease',
                        fontFamily: 'Material Icons',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                      title="Settings"
                    >
                      settings
                    </button>
                  </div>
                );
              })}
            </div>
          </Box>
        </div>
      </div>

      {/* Right section: Table Editor */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: 6,
          padding: 20,
          marginRight: 20,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {selectedIndex === null ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999',
              fontSize: 16,
            }}
          >
            Select a table to view and edit
          </div>
        ) : (
          <>
            {/* Table header with title */}
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
                {titles[selectedIndex]}
              </h2>
              {selectedDate && (
                <div style={{ marginTop: 8, color: '#666', fontSize: 16 }}>
                  Adding row for: {selectedDate}
                </div>
              )}
            </div>

            {!selectedDate ? (
              // Column management mode
              <>
                <div data-tutorial="column-management" style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 18 }}>Manage Columns</h3>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <TextInput
                      placeholder="New column name"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addColumn();
                      }}
                      style={{ flex: 1 }}
                    />
                    <Button onClick={addColumn} variant="filled" color="blue">
                      Add Column
                    </Button>
                  </div>
                  
                  <div data-tutorial="column-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {currentSchema?.columns.map((col) => (
                      <div
                        key={col}
                        onClick={() => col !== 'Date' && toggleHeatmap(col)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 
                            selectedHeatmapColumn === col ? '#1976d2' :
                            col === 'Date' ? '#e3f2fd' : '#f5f5f5',
                          color: selectedHeatmapColumn === col ? '#fff' : '#000',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: col !== 'Date' ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span>{col}</span>
                        {selectedHeatmapColumn === col && (
                          <span style={{ fontSize: 12, opacity: 0.9 }}>📊</span>
                        )}
                        {col !== 'Date' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeColumn(col);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: selectedHeatmapColumn === col ? '#fff' : '#d32f2f',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: 16,
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {currentSchema && currentSchema.columns.length > 1 ? (
                  <div style={{ padding: 20, backgroundColor: '#f9f9f9', borderRadius: 6, textAlign: 'center', color: '#666' }}>
                    Select a date from the calendar to add or edit a row
                  </div>
                ) : (
                  <div style={{ padding: 20, backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6, textAlign: 'center', color: '#856404' }}>
                    Add at least one column (other than Date) before adding rows
                  </div>
                )}
              </>
            ) : (
              // Row entry mode
              <>
                <div data-tutorial="row-entry" style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 18 }}>
                    {currentSchema?.data.some((row) => row.Date === selectedDate) ? 'Edit Row Data' : 'Enter Row Data'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {currentSchema?.columns
                      .filter((col) => col !== 'Date')
                      .map((col) => (
                        <div key={col} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <label style={{ width: 150, fontWeight: 500 }}>{col}:</label>
                          <TextInput
                            value={currentRowData[col] || ''}
                            onChange={(e) => updateCurrentRowData(col, e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      ))}
                  </div>
                  <Button 
                    onClick={addRow} 
                    variant="filled" 
                    color="green"
                    style={{ marginTop: 16 }}
                  >
                    {currentSchema?.data.some((row) => row.Date === selectedDate) ? 'Update Row' : 'Add Row'}
                  </Button>
                </div>
              </>
            )}

            {/* Table display */}
            <div
              data-tutorial="table-display"
              style={{
                flex: 1,
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                minHeight: 0,
              }}
            >
              {currentSchema && currentSchema.data.length === 0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    color: '#666',
                  }}
                >
                  No rows yet. Select a date to add your first row.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            style={{
                              padding: '12px 8px',
                              textAlign: 'left',
                              backgroundColor: '#f8f9fa',
                              borderBottom: '2px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              fontWeight: 600,
                              position: 'sticky',
                              top: 0,
                              zIndex: 1,
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            style={{
                              padding: '8px',
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Settings Modal */}
      <Modal
        opened={settingsModalOpen}
        onClose={closeSettings}
        title="Table Settings"
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Rename section */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Table Name
            </label>
            <TextInput
              value={editedTableName}
              onChange={(e) => setEditedTableName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') renameTable();
              }}
              placeholder="Enter table name"
            />
          </div>

          {/* Delete section */}
          <div style={{ paddingTop: 8, borderTop: '1px solid #dee2e6' }}>
            <Button
              onClick={deleteTable}
              variant="filled"
              color="red"
              fullWidth
            >
              Delete Table
            </Button>
            <div style={{ marginTop: 8, fontSize: 12, color: '#d32f2f', textAlign: 'center' }}>
              Warning: Cannot be undone!
            </div>
          </div>

          {/* Save button */}
          <div style={{ paddingTop: 8, borderTop: '1px solid #dee2e6' }}>
            <Button
              onClick={renameTable}
              variant="filled"
              color="blue"
              fullWidth
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        opened={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={`Export ${exportType === 'graph' ? 'Line Graph' : 'Heatmap'} - ${selectedIndex !== null ? titles[selectedIndex] : ''} - ${selectedHeatmapColumn || ''}`}
        size="xl"
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Preview */}
          {exportType === 'graph' ? (
            <div 
              ref={exportCanvasRef}
              style={{ 
                width: '100%', 
                height: 400,
                border: '1px solid #dee2e6',
                borderRadius: 6,
              }}
            >
              {currentExportData.length > 0 && selectedHeatmapColumn ? (
                <ExportGraph 
                  data={currentExportData} 
                  columnName={selectedHeatmapColumn}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: '#666'
                }}>
                  No data available
                </div>
              )}
            </div>
          ) : (
            <div 
              ref={heatmapCanvasRef}
              style={{ 
                width: '100%', 
                padding: 20,
                border: '1px solid #dee2e6',
                borderRadius: 6,
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CalyraCalendar 
                clearToken={0} 
                onDateSelected={() => {}}
                heatmapData={getHeatmapData}
              />
            </div>
          )}

          {/* Download button */}
          <Button
            onClick={downloadGraph}
            variant="filled"
            color="blue"
            fullWidth
            disabled={currentExportData.length === 0}
          >
            Download {exportType === 'graph' ? 'Graph' : 'Heatmap'}
          </Button>

          <div style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
            Data saved to IndexedDB • {currentExportData.length} data points
          </div>
        </div>
      </Modal>
    </div>
  );
}
