'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { ChartDataPoint } from '@/types/progress';

interface ProgressChartProps {
  type: 'pie' | 'bar' | 'line' | 'area';
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
];

const DIFFICULTY_COLORS = {
  Easy: '#10b981',   // emerald-500
  Medium: '#f59e0b', // amber-500
  Hard: '#ef4444',   // red-500
};

export function ProgressChart({
  type,
  data,
  title,
  height = 300,
  showLegend = true,
  colors = DEFAULT_COLORS
}: ProgressChartProps) {
  const getColor = (index: number, name?: string) => {
    if (name && name in DIFFICULTY_COLORS) {
      return DIFFICULTY_COLORS[name as keyof typeof DIFFICULTY_COLORS];
    }
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-card-foreground font-medium">{label || data.payload.name}</p>
          <p className="text-primary">
            {`Value: ${data.value}`}
            {data.payload.percentage && ` (${(data.payload.percentage * 100).toFixed(1)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={height < 200 ? 30 : 60}
              outerRadius={height < 200 ? 60 : 100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percentage }) => `${name}: ${(percentage * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || getColor(index, entry.name)}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              fill="#3b82f6"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || getColor(index, entry.name)}
                />
              ))}
            </Bar>
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              fill="url(#colorGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      {showLegend && type === 'pie' && (
        <div className="flex flex-wrap gap-4 justify-center">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color || getColor(index, entry.name) }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}