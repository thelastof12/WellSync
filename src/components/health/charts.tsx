import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { prettyDate } from "@/lib/health-data";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  background: "var(--raised)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  fontSize: 12,
  fontFamily: "var(--font-sans)",
  color: "var(--foreground)",
} as const;

export interface SeriesSpec {
  key: string;
  name: string;
  color: string;
}

export function TrendArea({
  data,
  series,
  height = 260,
}: {
  data: Array<Record<string, unknown>>;
  series: SeriesSpec[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
        <XAxis dataKey="date" tickFormatter={(v: string) => prettyDate(v)} minTickGap={24} {...axis} />
        <YAxis {...axis} width={46} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => prettyDate(String(v))} />
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 11 }} /> : null}
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({
  data,
  series,
  height = 240,
  xKey = "date",
}: {
  data: Array<Record<string, unknown>>;
  series: SeriesSpec[];
  height?: number;
  xKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
        <XAxis
          dataKey={xKey}
          tickFormatter={(v: string) => (xKey === "date" ? prettyDate(v) : v)}
          minTickGap={24}
          {...axis}
        />
        <YAxis {...axis} width={46} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(v) => (xKey === "date" ? prettyDate(String(v)) : String(v))}
        />
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 11 }} /> : null}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendBars({
  data,
  series,
  height = 240,
  xKey = "date",
  stacked,
}: {
  data: Array<Record<string, unknown>>;
  series: SeriesSpec[];
  height?: number;
  xKey?: string;
  stacked?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
        <XAxis
          dataKey={xKey}
          tickFormatter={(v: string) => (xKey === "date" ? prettyDate(v) : v)}
          minTickGap={16}
          {...axis}
        />
        <YAxis {...axis} width={46} />
        <Tooltip
          cursor={{ fill: "color-mix(in oklab, var(--foreground) 6%, transparent)" }}
          contentStyle={tooltipStyle}
          labelFormatter={(v) => (xKey === "date" ? prettyDate(String(v)) : String(v))}
        />
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 11 }} /> : null}
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            radius={[6, 6, 0, 0]}
            {...(stacked ? { stackId: "a" } : {})}
            maxBarSize={26}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({
  data,
  height = 220,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="88%"
          paddingAngle={3}
          stroke="none"
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
