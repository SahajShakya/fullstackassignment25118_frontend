import { useQuery } from '@apollo/client/react';
import { Card } from '@/components/ui/card';
import { AnalyticsMetricCard } from '@/components/AnalyticsMetricCard';
import { GET_ANALYTICS_BY_DOMAIN } from '@/graphql/widgetQueries';
import type { GetAnalyticsByDomainResponse } from '@/types/widget';

interface WidgetAnalyticsCardProps {
  domain: string;
}

export function WidgetAnalyticsCard({ domain }: WidgetAnalyticsCardProps) {
  const { data, loading } = useQuery<GetAnalyticsByDomainResponse>(GET_ANALYTICS_BY_DOMAIN, {
    variables: { domain },
  });

  const analytics = data?.getAnalyticsByDomain;

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-2"><div className="h-8 bg-muted rounded animate-pulse" /></Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      <AnalyticsMetricCard label="Loads" value={analytics?.pageView || 0} size="small" />
      <AnalyticsMetricCard label="Plays" value={analytics?.videoLoaded || 0} size="small" />
      <AnalyticsMetricCard label="Clicks" value={analytics?.linkClicked || 0} size="small" />
    </div>
  );
}
