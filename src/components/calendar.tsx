'use client';

import dayjs from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@mantine/dates';

type CalyraCalendarProps = {
  clearToken?: number; // Incremented to clear selection from parent
  onDateSelected?: (date: string | null) => void; // Callback when date is selected/deselected
  heatmapData?: { [date: string]: number }; // Date -> numeric value mapping for heatmap
};

export default function CalyraCalendar({ clearToken, onDateSelected, heatmapData }: CalyraCalendarProps) {
  const [selected, setSelected] = useState<string | null>(dayjs().format('YYYY-MM-DD'));

  // Clear selection when parent increments clearToken
  useEffect(() => {
    if (typeof clearToken !== 'undefined') {
      setSelected(null);
    }
  }, [clearToken]);

  // Calculate min/max for heatmap normalization
  const { minValue, maxValue } = useMemo(() => {
    if (!heatmapData || Object.keys(heatmapData).length === 0) {
      return { minValue: 0, maxValue: 0 };
    }
    
    const values = Object.values(heatmapData);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [heatmapData]);

  const getHeatmapColor = (date: string) => {
    if (!heatmapData) return undefined;
    
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    const value = heatmapData[formattedDate];
    
    if (value === undefined) return undefined;
    
    // Normalize value between 0 and 1
    const range = maxValue - minValue;
    const normalized = range === 0 ? 0.5 : (value - minValue) / range;
    
    // Create color gradient from light blue to dark blue
    const lightness = 90 - (normalized * 60); // 90% to 30%
    return `hsl(210, 100%, ${lightness}%)`;
  };

  const handleSelect = (date: string) => {
    const isSelected = selected && dayjs(date).isSame(selected, 'date');
    if (isSelected) {
      setSelected(null);
      onDateSelected?.(null); // Notify parent that date was deselected
    } else {
      setSelected(date);
      onDateSelected?.(dayjs(date).format('YYYY-MM-DD')); // Notify parent with formatted date
    }
  };

  return (
    <Calendar
      getDayProps={(date) => {
        const backgroundColor = getHeatmapColor(date);
        
        return {
          selected: selected ? dayjs(date).isSame(selected, 'date') : false,
          onClick: () => handleSelect(date),
          style: backgroundColor ? { backgroundColor } : undefined,
        };
      }}
      size="lg"
    />
  );
}
