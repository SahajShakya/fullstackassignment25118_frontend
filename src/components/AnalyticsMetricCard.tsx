import { Card } from '@/components/ui/card';

interface AnalyticsMetricCardProps {
  label: string;
  value: number;
  size?: 'small' | 'large';
}

export function AnalyticsMetricCard({ label, value, size = 'large' }: AnalyticsMetricCardProps) {
  const isSmall = size === 'small';
  
  return (
    <Card className={`${isSmall ? 'p-2 bg-slate-50' : 'p-4'}`}>
      <p className={`${isSmall ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{label}</p>
      <p className={`${isSmall ? 'text-lg' : 'text-2xl'} font-bold`}>{value}</p>
    </Card>
  );
}
