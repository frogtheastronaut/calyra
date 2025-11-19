'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ZAxis } from 'recharts';

type ScatterPlotProps = {
  data: { date: string; value: number }[];
  columnName: string;
};

export default function ScatterPlot({ data, columnName }: ScatterPlotProps) {
  // Convert data to scatter format with numeric x-axis
  const scatterData = data.map((item, index) => ({
    x: index + 1,
    y: item.value,
    date: item.date,
  }));

  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 30, right: 40, left: 30, bottom: 80 }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number"
          dataKey="x"
          name="Entry"
          style={{ fontSize: 12 }}
        />
        <YAxis 
          type="number"
          dataKey="y"
          name={columnName}
          style={{ fontSize: 12 }}
        />
        <ZAxis range={[100, 100]} />
        <Scatter 
          name={columnName}
          data={scatterData} 
          fill="#2684FF"
          isAnimationActive={false}
        />
      </ScatterChart>
    </ResponsiveContainer>
    </div>
  );
}
