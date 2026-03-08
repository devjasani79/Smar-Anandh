import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useAdherenceStats } from '@/hooks/useAdherenceStats';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

const chartConfig: ChartConfig = {
  taken: {
    label: 'Taken',
    color: 'hsl(var(--success))',
  },
  missed: {
    label: 'Missed',
    color: 'hsl(var(--destructive))',
  },
};

interface AdherenceChartProps {
  seniorId: string;
}

export function AdherenceChart({ seniorId }: AdherenceChartProps) {
  const { data: stats = [], isLoading } = useAdherenceStats(seniorId);

  const chartData = [...stats]
    .reverse()
    .slice(-14)
    .map((s) => ({
      date: format(parseISO(s.adherence_date), 'MMM d'),
      taken: s.meds_taken,
      missed: s.meds_missed,
      percentage: s.adherence_percentage,
    }));

  const avgAdherence =
    stats.length > 0
      ? Math.round(
          stats.reduce((sum, s) => sum + (s.adherence_percentage || 0), 0) / stats.length
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-warm"
    >
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Medication Adherence
        </h2>
        {!isLoading && stats.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{avgAdherence}%</p>
            <p className="text-xs text-muted-foreground">30-day avg</p>
          </div>
        )}
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No adherence data available yet. Data appears after medications are logged.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={chartData} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="taken"
                fill="var(--color-taken)"
                radius={[4, 4, 0, 0]}
                stackId="a"
              />
              <Bar
                dataKey="missed"
                fill="var(--color-missed)"
                radius={[4, 4, 0, 0]}
                stackId="a"
              />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </motion.div>
  );
}
