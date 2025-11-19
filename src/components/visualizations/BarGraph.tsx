'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

type BarGraphProps = {
  data: { date: string; value: number }[];
  columnName: string;
};

export default function BarGraph({ data, columnName }: BarGraphProps) {
  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          angle={-45}
          textAnchor="end"
          height={100}
          style={{ fontSize: 12 }}
        />
        <YAxis style={{ fontSize: 12 }} />
        <Bar 
          dataKey="value" 
          fill="#2684FF" 
          name={columnName}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
