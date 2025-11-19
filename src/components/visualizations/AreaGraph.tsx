'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

type AreaGraphProps = {
  data: { date: string; value: number }[];
  columnName: string;
};

export default function AreaGraph({ data, columnName }: AreaGraphProps) {
  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#2684FF" 
          fill="#2684FF"
          fillOpacity={0.6}
          strokeWidth={2}
          name={columnName}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  );
}
